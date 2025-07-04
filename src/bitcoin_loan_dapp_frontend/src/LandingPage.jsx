import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./HowItWorks.css";

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

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <p className="how-it-works-subtitle">
            Get liquidity from your Bitcoin in four simple steps. Our streamlined process ensures you can access funds quickly while maintaining full control of your assets.
          </p>
          
          <div className="steps-container">
            {[
              {
                number: "1",
                icon: "🔌",
                title: "Connect Wallet",
                description: "Securely connect your wallet to our platform using Internet Identity for seamless authentication.",
              },
              {
                number: "2",
                icon: "🔒",
                title: "Lock Bitcoin",
                description: "Deposit your Bitcoin into a secure, non-custodial vault powered by smart contracts.",
              },
              {
                number: "3",
                icon: "💵",
                title: "Receive Loan",
                description: "Instantly receive your loan in stablecoins or other cryptocurrencies at competitive rates.",
              },
              {
                number: "4",
                icon: "✅",
                title: "Repay & Unlock",
                description: "Repay your loan at any time and automatically unlock your Bitcoin collateral.",
              },
            ].map((step) => (
              <div key={step.number} className="step-card">
                <div className="step-number">{step.number}</div>
                <span className="step-icon">{step.icon}</span>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
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