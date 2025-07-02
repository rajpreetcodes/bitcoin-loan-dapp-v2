import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login();
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      <section className="hero">
        <img src="/logo2.svg" alt="Bitcoin Hero" />
        <h1 className="hero-title">
          Bitcoin-Backed Loans. Decentralized. Non-Custodial.
        </h1>
        <p className="hero-sub">
          Get liquidity without selling your BTC — on-chain, secure, and trustless.
        </p>
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? "Connecting…" : "Launch App"}
        </button>
      </section>

      {/* Features */}
      <section className="features container">
        <h2>Key Features</h2>
        <p className="hero-sub" style={{ maxWidth: "600px" }}>
          Explore the innovative features that make our platform the premier choice for Bitcoin-backed loans.
        </p>

        <div className="features-grid">
          {[
            {
              title: "🛡 Non-Custodial Vaults",
              desc: "Your Bitcoin remains under your control, secured by smart contracts.",
            },
            {
              title: "🛋️ Instant, Flexible Loans",
              desc: "Access liquidity with loan terms tailored to your needs.",
            },
            {
              title: "🌸 Smart-Contract Driven",
              desc: "Security and transparency via our smart contract system.",
            },
            {
              title: "🌐 Runs on Internet Computer",
              desc: "Decentralized and scalable platform powered by ICP.",
            },
          ].map((f) => (
            <div key={f.title} className="card">
              <h3 className="card-title">{f.title}</h3>
              <p className="card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="steps container">
        <h2>How It Works</h2>
        {[
          {
            step: "Step 1: Connect Wallet",
            desc: "Connect your secure wallet to our platform.",
          },
          {
            step: "Step 2: Lock Bitcoin",
            desc: "Deposit your Bitcoin into a non-custodial vault.",
          },
          {
            step: "Step 3: Receive Loan",
            desc: "Receive your loan in stablecoins or other cryptocurrencies.",
          },
          {
            step: "Step 4: Repay + Unlock",
            desc: "Repay your loan and unlock your Bitcoin.",
          },
        ].map((s) => (
          <div key={s.step} className="step">
            <p className="step-title">{s.step}</p>
            <p className="step-desc">{s.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#">Home</a>
          <a href="#">How It Works</a>
          <a href="#">Docs</a>
        </div>

        <div className="socials">
          <span role="img" aria-label="partners">🤝</span>
          <span role="img" aria-label="twitter">🕊️</span>
          <span role="img" aria-label="instagram">📷</span>
        </div>

        © 2024 Bitcoin-Backed Loan Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage; 