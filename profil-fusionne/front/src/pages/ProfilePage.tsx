import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import FormField from '../components/FormField';
import Layout from '../components/Layout';

function useFormAction() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<void>, successMessage: string) {
    setError(null);
    setSuccess(null);
    setPending(true);
    try {
      await action();
      setSuccess(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setPending(false);
    }
  }

  return { error, success, pending, run };
}

function PersonalInfoSection() {
  const { user, updateProfile } = useAuth();
  const { error, success, pending, run } = useFormAction();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [age, setAge] = useState(String(user?.age ?? ''));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void run(
      () => updateProfile({ firstName, lastName, age: Number(age) }),
      'Vos informations ont été mises à jour.',
    );
  }

  return (
    <Card className="mt-6 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-950">
        Informations personnelles
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Votre prénom, votre nom et votre âge.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            autoComplete="given-name"
            id="profile-firstname"
            label="Prénom"
            onChange={(e) => setFirstName(e.target.value)}
            required
            type="text"
            value={firstName}
          />
          <FormField
            autoComplete="family-name"
            id="profile-lastname"
            label="Nom"
            onChange={(e) => setLastName(e.target.value)}
            required
            type="text"
            value={lastName}
          />
        </div>

        <FormField
          id="profile-age"
          label="Âge"
          max={120}
          min={0}
          onChange={(e) => setAge(e.target.value)}
          required
          type="number"
          value={age}
        />

        <Button disabled={pending} type="submit">
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>
    </Card>
  );
}

function EmailSection() {
  const { user, updateEmail } = useAuth();
  const { error, success, pending, run } = useFormAction();
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await updateEmail(email, currentPassword);
      setCurrentPassword('');
    }, 'Votre adresse email a été mise à jour.');
  }

  return (
    <Card className="mt-6 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-950">Adresse email</h2>
      <p className="mt-1 text-sm text-slate-600">
        Pour la modifier, confirmez votre mot de passe actuel.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <FormField
          autoComplete="email"
          id="profile-email"
          label="Nouvelle adresse email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
        <FormField
          autoComplete="current-password"
          id="profile-email-password"
          label="Mot de passe actuel"
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          type="password"
          value={currentPassword}
        />

        <Button disabled={pending} type="submit">
          {pending ? 'Enregistrement…' : "Changer l'email"}
        </Button>
      </form>
    </Card>
  );
}

function PasswordSection() {
  const { changePassword } = useAuth();
  const { error, success, pending, run } = useFormAction();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      if (newPassword !== confirmation) {
        throw new Error('Les deux mots de passe ne correspondent pas');
      }
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
    }, 'Votre mot de passe a été modifié.');
  }

  return (
    <Card className="mt-6 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-950">Mot de passe</h2>
      <p className="mt-1 text-sm text-slate-600">
        Choisissez un nouveau mot de passe d'au moins 8 caractères.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <FormField
          autoComplete="current-password"
          id="profile-current-password"
          label="Mot de passe actuel"
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          type="password"
          value={currentPassword}
        />
        <FormField
          autoComplete="new-password"
          id="profile-new-password"
          label="Nouveau mot de passe"
          minLength={8}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Au moins 8 caractères"
          required
          type="password"
          value={newPassword}
        />
        <FormField
          autoComplete="new-password"
          id="profile-confirm-password"
          label="Confirmer le nouveau mot de passe"
          minLength={8}
          onChange={(e) => setConfirmation(e.target.value)}
          required
          type="password"
          value={confirmation}
        />

        <Button disabled={pending} type="submit">
          {pending ? 'Enregistrement…' : 'Changer le mot de passe'}
        </Button>
      </form>
    </Card>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const initials =
    `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Layout>
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 lg:py-20">
        <Link
          className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
          to="/"
        >
          ← Retour à l'accueil
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Mon espace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Mon profil
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Consultez et modifiez vos informations personnelles.
          </p>
        </div>

        <Card className="mt-8 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-sm text-slate-600">{user.email}</p>
              <div className="mt-2">
                <Badge>Membre depuis le {memberSince}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <PersonalInfoSection />
        <EmailSection />
        <PasswordSection />
      </main>
    </Layout>
  );
}