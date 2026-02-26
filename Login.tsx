import React, { useState } from "react";
import { login } from "./services/api";

interface Props {
  onLoginSuccess: (token: string) => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onLoginSuccess, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await login(email, password);
      onLoginSuccess(data.token); // ⬅️ on passe le token à App
    } catch (error) {
      alert("Erreur login");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-purple-800">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white p-8 border-4 border-black"
      >
        <h2 className="font-black text-xl">Connexion</h2>

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

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 font-black"
        >
          Se connecter
        </button>
      </form>
      <button
        type="button"
        onClick={onSwitchToRegister}
        className="text-sm underline font-bold"
      >
        Créer un compte
      </button>
    </div>
  );
}