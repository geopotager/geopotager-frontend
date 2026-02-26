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
  <div className="h-screen flex items-center justify-center bg-lime-600">
    <div className="flex flex-col gap-4 bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

      <h2 className="font-black text-xl text-center">Connexion</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-2 border-black p-2"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-2 border-black p-2"
          required
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 font-black border-2 border-black hover:bg-white hover:text-black transition-none"
        >
          Se connecter
        </button>
      </form>

      {/* Séparation néo-brutaliste */}
      <div className="border-t-4 border-black pt-4">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="w-full border-2 border-black px-4 py-2 font-black bg-white hover:bg-black hover:text-white transition-none"
        >
          Créer un compte
        </button>
      </div>

    </div>
  </div>
);
}