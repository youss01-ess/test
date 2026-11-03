import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as argon2 from '@node-rs/argon2';
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

class FakeUsersService {
  users: User[] = [];

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.email === email) ?? null);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.id === id) ?? null);
  }

  update(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return Promise.reject(new Error('Utilisateur introuvable'));

    const defined = Object.entries(data).filter(([, v]) => v !== undefined);
    Object.assign(user, Object.fromEntries(defined), { updatedAt: new Date() });
    return Promise.resolve(user);
  }
}

const PASSWORD = 'motdepasse123';
const BASE = '/users/me';

function makeUser(email: string, passwordHash: string): User {
  return {
    id: randomUUID(),
    email,
    passwordHash,
    firstName: 'Test',
    lastName: 'User',
    age: 25,
    birthDate: null,
    sex: null,
    latitude: null,
    longitude: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('ProfileController', () => {
  let app: INestApplication;
  let fakeUsers: FakeUsersService;
  let token: string;

  beforeEach(async () => {
    fakeUsers = new FakeUsersService();
    const me = makeUser('test@mail.com', await argon2.hash(PASSWORD));
    fakeUsers.users.push(me, makeUser('autre@mail.com', 'hash-inutilise'));

    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret-de-test',
          signOptions: { expiresIn: 3600 },
        }),
      ],
      controllers: [ProfileController],
      providers: [
        ProfileService,
        JwtAuthGuard,
        { provide: UsersService, useValue: fakeUsers },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    token = moduleRef.get(JwtService).sign({ sub: me.id, email: me.email });
  });

  afterEach(async () => {
    await app.close();
  });

  const anonymous = () => request(app.getHttpServer());
  const patch = (path: string) =>
    request(app.getHttpServer())
      .patch(path)
      .set('Authorization', `Bearer ${token}`);

  describe(`PATCH ${BASE}`, () => {
    it('refuse sans jeton (401)', async () => {
      await anonymous().patch(BASE).send({ firstName: 'Léa' }).expect(401);
    });

    it('modifie prénom, nom et âge (200)', async () => {
      const res = await patch(BASE)
        .send({ firstName: 'Léa', lastName: 'Martin', age: 30 })
        .expect(200);

      expect(res.body).toMatchObject({
        firstName: 'Léa',
        lastName: 'Martin',
        age: 30,
      });
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it("ignore l'email et le hash envoyés par ce biais", async () => {
      await patch(BASE)
        .send({ firstName: 'Léa', email: 'pirate@mail.com', passwordHash: 'x' })
        .expect(200);

      expect(fakeUsers.users[0].email).toBe('test@mail.com');
      expect(fakeUsers.users[0].passwordHash).toMatch(/^\$argon2/);
    });

    it('refuse un âge incohérent (400)', async () => {
      await patch(BASE).send({ age: 250 }).expect(400);
    });

    it('refuse un prénom vide (400)', async () => {
      await patch(BASE).send({ firstName: '   ' }).expect(400);
    });

    it('refuse un jeton dont le compte a été supprimé (401)', async () => {
      fakeUsers.users = [];
      await patch(BASE).send({ firstName: 'Léa' }).expect(401);
    });
  });

  describe(`PATCH ${BASE}/email`, () => {
    it('refuse sans jeton (401)', async () => {
      await anonymous()
        .patch(`${BASE}/email`)
        .send({ email: 'nouveau@mail.com', currentPassword: PASSWORD })
        .expect(401);
    });

    it('refuse un mauvais mot de passe actuel (403)', async () => {
      await patch(`${BASE}/email`)
        .send({ email: 'nouveau@mail.com', currentPassword: 'faux12345' })
        .expect(403);
    });

    it("change l'email en minuscules (200)", async () => {
      const res = await patch(`${BASE}/email`)
        .send({ email: 'Nouveau@Mail.com', currentPassword: PASSWORD })
        .expect(200);

      expect(res.body.email).toBe('nouveau@mail.com');
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('refuse un email déjà utilisé (409)', async () => {
      await patch(`${BASE}/email`)
        .send({ email: 'autre@mail.com', currentPassword: PASSWORD })
        .expect(409);
    });

    it('refuse un email invalide (400)', async () => {
      await patch(`${BASE}/email`)
        .send({ email: 'abc', currentPassword: PASSWORD })
        .expect(400);
    });
  });

  describe(`PATCH ${BASE}/password`, () => {
    it('refuse sans jeton (401)', async () => {
      await anonymous()
        .patch(`${BASE}/password`)
        .send({ currentPassword: PASSWORD, newPassword: 'nouveaumotdepasse' })
        .expect(401);
    });

    it('refuse un mauvais mot de passe actuel (403)', async () => {
      await patch(`${BASE}/password`)
        .send({ currentPassword: 'faux12345', newPassword: 'nouveaumotdepasse' })
        .expect(403);
    });

    it('refuse un nouveau mot de passe trop court (400)', async () => {
      await patch(`${BASE}/password`)
        .send({ currentPassword: PASSWORD, newPassword: '123' })
        .expect(400);
    });

    it("refuse un nouveau mot de passe identique à l'ancien (400)", async () => {
      await patch(`${BASE}/password`)
        .send({ currentPassword: PASSWORD, newPassword: PASSWORD })
        .expect(400);
    });

    it('change le mot de passe et stocke un nouveau hash (204)', async () => {
      await patch(`${BASE}/password`)
        .send({ currentPassword: PASSWORD, newPassword: 'nouveaumotdepasse' })
        .expect(204);

      const { passwordHash } = fakeUsers.users[0];
      expect(await argon2.verify(passwordHash, 'nouveaumotdepasse')).toBe(true);
      expect(await argon2.verify(passwordHash, PASSWORD)).toBe(false);
    });
  });
});