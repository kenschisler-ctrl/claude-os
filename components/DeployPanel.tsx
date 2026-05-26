"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle, XCircle, Clock, Globe, Server, Shield, Package } from "lucide-react";

interface DeployStep {
  id: string;
  name: string;
  status: "pending" | "running" | "done" | "failed";
  duration?: string;
  log?: string;
}

interface Deployment {
  id: string;
  name: string;
  env: "production" | "staging" | "dev";
  status: "deployed" | "failed" | "pending";
  deployedAt: string;
  version: string;
  url: string;
}

const ENVS = {
  production: { color: "#ff2d9b", label: "PROD" },
  staging: { color: "#ffb800", label: "STAGE" },
  dev: { color: "#00ff87", label: "DEV" },
};

const INITIAL_DEPLOYMENTS: Deployment[] = [
  { id: "1", name: "CLAUDE OS Frontend", env: "production", status: "deployed", deployedAt: "2h ago", version: "v2.0.1", url: "localhost:3000" },
  { id: "2", name: "Agent API Gateway", env: "staging", status: "deployed", deployedAt: "5h ago", version: "v1.4.0", url: "localhost:3001" },
  { id: "3", name: "Memory Service", env: "dev", status: "failed", deployedAt: "1d ago", version: "v0.9.2", url: "localhost:3002" },
];

export default function DeployPanel() {
  const [deployments] = useState<Deployment[]>(INITIAL_DEPLOYMENTS);
  const [isDeploying, setIsDeploying] = useState(false);
  const [steps, setSteps] = useState<DeployStep[]>([]);
  const [env, setEnv] = useState<"production" | "staging" | "dev">("staging");

  const DEPLOY_STEPS: Omit<DeployStep, "status">[] = [
    { id: "1", name: "Install dependencies", log: "Running npm install..." },
    { id: "2", name: "Run type check", log: "tsc --noEmit..." },
    { id: "3", name: "Build application", log: "next build..." },
    { id: "4", name: "Run tests", log: "jest --ci..." },
    { id: "5", name: "Deploy to environment", log: `Deploying to ${env}...` },
    { id: "6", name: "Health check", log: "Checking endpoint..." },
  ];

  const startDeploy = () => {
    setIsDeploying(true);
    const initial = DEPLOY_STEPS.map((s) => ({ ...s, status: "pending" as const }));
    setSteps(initial);

    initial.forEach((step, i) => {
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s) => (s.id === step.id ? { ...s, status: "running" } : s))
        );
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((s) => s.id === step.id ? { ...s, status: "done", duration: `${(0.5 + Math.random() * 3).toFixed(1)}s` } : s)
          );
          if (i === initial.length - 1) {
            setTimeout(() => setIsDeploying(false), 800);
          }
        }, 900 + Math.random() * 1500);
      }, i * 2200);
    });
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ background: "rgba(4,13,26,0.6)", border: "1px solid rgba(255,184,0,0.12)" }}
      >
        <div>
          <div className="text-xs font-bold tracking-widest" style={{ color: "#ffb800" }}>DEPLOYMENT CENTER</div>
          <div className="text-[9px] tracking-wider" style={{ color: "rgba(107,143,168,0.4)" }}>CI/CD pipeline control</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Env selector */}
          <div className="flex gap-1">
            {(Object.keys(ENVS) as (keyof typeof ENVS)[]).map((e) => (
              <button
                key={e}
                onClick={() => setEnv(e)}
                className="px-2 py-1 rounded text-[9px] font-bold tracking-wider transition-all"
                style={{
                  background: env === e ? `${ENVS[e].color}20` : "transparent",
                  border: `1px solid ${env === e ? `${ENVS[e].color}50` : "rgba(0,212,255,0.08)"}`,
                  color: env === e ? ENVS[e].color : "rgba(107,143,168,0.5)",
                }}
              >
                {ENVS[e].label}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startDeploy}
            disabled={isDeploying}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, rgba(255,184,0,0.3), rgba(255,45,155,0.2))",
              border: "1px solid rgba(255,184,0,0.4)",
              color: "#ffb800",
              boxShadow: "0 0 20px rgba(255,184,0,0.15)",
            }}
          >
            <Zap size={12} />
            {isDeploying ? "DEPLOYING..." : "DEPLOY NOW"}
          </motion.button>
        </div>
      </div>

      {/* Active deploy pipeline */}
      <AnimatePresence>
        {steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl overflow-hidden"
            style={{ background: "rgba(6,18,34,0.8)", border: "1px solid rgba(255,184,0,0.15)" }}
          >
            <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,184,0,0.1)" }}>
              {isDeploying ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 rounded-full border border-amber-400 border-t-transparent"
                />
              ) : (
                <CheckCircle size={13} style={{ color: "#00ff87" }} />
              )}
              <span className="text-[11px] font-bold tracking-widest" style={{ color: "#ffb800" }}>
                {isDeploying ? "DEPLOYING TO " + env.toUpperCase() : "DEPLOYMENT COMPLETE"}
              </span>
            </div>
            <div className="p-4 space-y-2">
              {steps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 flex justify-center">
                    {step.status === "done" ? <CheckCircle size={13} style={{ color: "#00ff87" }} />
                      : step.status === "failed" ? <XCircle size={13} style={{ color: "#ff2d9b" }} />
                      : step.status === "running" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-3 h-3 rounded-full border border-amber-400 border-t-transparent"
                        />
                      ) : <div className="w-3 h-3 rounded-full" style={{ border: "1px solid rgba(107,143,168,0.2)" }} />}
                  </div>
                  <span className="text-xs flex-1" style={{
                    color: step.status === "done" ? "rgba(232,244,255,0.8)"
                      : step.status === "running" ? "#ffb800"
                      : "rgba(107,143,168,0.4)"
                  }}>
                    {step.name}
                  </span>
                  {step.status === "running" && step.log && (
                    <span className="text-[10px] font-mono" style={{ color: "rgba(107,143,168,0.5)" }}>{step.log}</span>
                  )}
                  {step.duration && (
                    <span className="text-[9px]" style={{ color: "#00ff87" }}>{step.duration}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deployments list */}
      <div>
        <div className="text-[10px] tracking-widest mb-3" style={{ color: "rgba(107,143,168,0.5)" }}>RECENT DEPLOYMENTS</div>
        <div className="space-y-2">
          {deployments.map((dep, i) => {
            const envCfg = ENVS[dep.env];
            return (
              <motion.div
                key={dep.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl flex items-center gap-4"
                style={{
                  background: "rgba(6,18,34,0.7)",
                  border: `1px solid ${dep.status === "deployed" ? "rgba(0,212,255,0.08)" : dep.status === "failed" ? "rgba(255,45,155,0.15)" : "rgba(255,255,255,0.04)"}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${envCfg.color}15`, border: `1px solid ${envCfg.color}25` }}
                >
                  {dep.status === "deployed" ? <CheckCircle size={16} style={{ color: "#00ff87" }} />
                    : dep.status === "failed" ? <XCircle size={16} style={{ color: "#ff2d9b" }} />
                    : <Clock size={16} style={{ color: "#ffb800" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium" style={{ color: "rgba(232,244,255,0.8)" }}>{dep.name}</span>
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wider"
                      style={{ background: `${envCfg.color}18`, color: envCfg.color }}
                    >
                      {envCfg.label}
                    </span>
                  </div>
                  <div className="text-[10px]" style={{ color: "rgba(107,143,168,0.4)" }}>
                    {dep.version} · {dep.deployedAt}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono" style={{ color: "rgba(0,212,255,0.5)" }}>{dep.url}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Infrastructure status */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Globe, label: "API GATEWAY", status: "ONLINE", color: "#00ff87" },
          { icon: Server, label: "COMPUTE", status: "HEALTHY", color: "#00d4ff" },
          { icon: Shield, label: "AUTH SERVICE", status: "ONLINE", color: "#7b2fff" },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-xl text-center"
            style={{ background: "rgba(6,18,34,0.7)", border: `1px solid ${item.color}15` }}
          >
            <item.icon size={20} style={{ color: item.color, margin: "0 auto 6px" }} />
            <div className="text-[9px] tracking-widest mb-1" style={{ color: "rgba(107,143,168,0.4)" }}>{item.label}</div>
            <div className="text-[10px] font-bold" style={{ color: item.color }}>{item.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
