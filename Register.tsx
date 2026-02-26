import React, { useState } from "react";
import { register } from "./services/api";

interface RegisterProps {
  onRegisterSuccess: (token: string) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { token } = await register(email, password, registrationCode);
      onRegisterSuccess(token);
    } catch (err: any) {
      setError("Inscription impossible");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-purple-600">
      <h2 className="text-2xl font-black mb-6">Créer un compte</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-2 border-black p-2"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-2 border-black p-2"
        />

        <input
          type="text"
          placeholder="Code jardinerie"
          value={registrationCode}
          onChange={(e) => setRegistrationCode(e.target.value)}
          className="border-2 border-black p-2"
        />

        <button
          type="submit"
          className="bg-black text-white p-2 font-bold"
        >
          S'inscrire
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <button
        onClick={onSwitchToLogin}
        className="mt-4 underline"
      >
        Déjà un compte ? Se connecter
      </button>
    </div>
  );
};

export default Register;