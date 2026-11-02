import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  Mail,
  Send,
  Server,
  ShieldCheck,
  Wifi,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/dev";

function getErrorHelp(diagnostic) {
  if (!diagnostic) return null;

  const code = diagnostic.code;
  const responseCode = diagnostic.responseCode;

  if (code === "EAUTH" || responseCode === 535) {
    return {
      title: "Authentication failed",
      message:
        "Gmail rejected the credentials. Check the Gmail address and 16-character App Password.",
    };
  }

  if (code === "ECONNECTION" || code === "ESOCKET") {
    return {
      title: "Connection interrupted",
      message:
        "The SMTP connection was closed unexpectedly. Inspect the SMTP response, connection logs, and TLS configuration.",
    };
  }

  if (code === "ETIMEDOUT") {
    return {
      title: "Connection timed out",
      message: "The SMTP server did not respond within the configured timeout.",
    };
  }

  if (responseCode === 550 || responseCode === 554) {
    return {
      title: "Email rejected",
      message:
        "Gmail rejected the email during delivery. Check the sender and recipient addresses.",
    };
  }

  return {
    title: "SMTP test failed",
    message: diagnostic.details || "Review the diagnostic information below.",
  };
}

function DiagnosticPanel({ diagnostic }) {
  const [expanded, setExpanded] = useState(false);

  if (!diagnostic) return null;

  const help = getErrorHelp(diagnostic);

  const details = [
    ["Error code", diagnostic.code],
    ["Response code", diagnostic.responseCode],
    ["Command", diagnostic.command],
    ["Details", diagnostic.details],
    ["SMTP response", diagnostic.response],
    ["System call", diagnostic.syscall],
    ["Address", diagnostic.address],
    ["Port", diagnostic.port],
    ["Error number", diagnostic.errno],
    ["Cause code", diagnostic.cause?.code],
    ["Cause message", diagnostic.cause?.message],
  ];

  const hasDetails = details.some(([, value]) => value != null);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-red-200 bg-white">
      <div className="border-b border-red-100 bg-red-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 shrink-0 text-red-700" size={18} />

          <div>
            <p className="font-bold text-red-900">{help.title}</p>
            <p className="mt-1 text-xs leading-5 text-red-800">
              {help.message}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Diagnostic information
          </p>

          <button
            type="button"
            onClick={() => setExpanded((previous) => !previous)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cozy-sage-dark hover:text-cozy-dark"
          >
            {expanded ? "Hide details" : "Show details"}
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {details.slice(0, 4).map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 border-b border-gray-100 pb-2 last:border-0"
          >
            <span className="text-xs text-gray-500">{label}</span>
            <span className="break-all text-sm font-medium text-gray-800">
              {value ?? "Not provided"}
            </span>
          </div>
        ))}

        {expanded && (
          <>
            {details.slice(4).map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-1 border-b border-gray-100 pb-2 last:border-0"
              >
                <span className="text-xs text-gray-500">{label}</span>
                <span className="break-all text-sm font-medium text-gray-800">
                  {value ?? "Not provided"}
                </span>
              </div>
            ))}

            {diagnostic.stack && (
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">
                  Error stack
                </p>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-gray-950 p-3 text-[11px] leading-5 text-green-300">
                  {diagnostic.stack}
                </pre>
              </div>
            )}
          </>
        )}

        {!hasDetails && (
          <p className="text-sm text-gray-500">
            The backend did not provide additional error details.
          </p>
        )}
      </div>
    </div>
  );
}

function ConfigurationPanel({ configuration }) {
  if (!configuration) return null;

  const items = [
    ["SMTP host", configuration.host],
    ["SMTP port", configuration.port],
    ["Secure connection", String(configuration.secure)],
    ["Username configured", String(configuration.usernameConfigured)],
    ["Username length", configuration.usernameLength],
    ["Password configured", String(configuration.passwordConfigured)],
    ["Password length", configuration.passwordLength],
    [
      "Password contains whitespace",
      String(configuration.passwordHasWhitespace),
    ],
  ];

  return (
    <div className="mt-4 rounded-2xl border border-[#e7dfd1] bg-white p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600">
        Runtime SMTP configuration
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-cozy-cream p-3">
            <p className="text-xs text-cozy-brown">{label}</p>
            <p className="mt-1 break-all text-sm font-bold text-cozy-dark">
              {value ?? "Not provided"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SmtpDiagnostics({ diagnostic }) {
  if (!diagnostic) return null;

  const tests = [
    {
      label: "Unauthenticated connection",
      description: "Checks whether Nodemailer can connect to Gmail.",
      result: diagnostic.unauthenticated,
    },
    {
      label: "Authenticated connection",
      description: "Checks the connection using your Gmail credentials.",
      result: diagnostic.authenticated,
    },
  ];

  return (
    <div className="mt-5 space-y-4">
      {tests.map(({ label, description, result }) => (
        <div
          key={label}
          className="rounded-2xl border border-[#e7dfd1] bg-white p-4"
        >
          <div className="flex items-start gap-3">
            {result?.success ? (
              <CheckCircle2
                className="mt-0.5 shrink-0 text-green-600"
                size={21}
              />
            ) : (
              <CircleAlert className="mt-0.5 shrink-0 text-red-600" size={21} />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-cozy-dark">{label}</p>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                    result?.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result?.success ? "Passed" : "Failed"}
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-cozy-brown">
                {description}
              </p>

              <p className="mt-2 break-words text-xs text-gray-600">
                {result?.message ||
                  result?.details ||
                  "The backend did not return a result for this test."}
              </p>
            </div>
          </div>

          {!result?.success && result && (
            <DiagnosticPanel diagnostic={result} />
          )}
        </div>
      ))}

      <ConfigurationPanel configuration={diagnostic.configuration} />
    </div>
  );
}

function TestResult({ result }) {
  if (!result) return null;

  const success = result.type === "success";
  const hasSmtpDiagnostics =
    result.diagnostic &&
    ("unauthenticated" in result.diagnostic ||
      "authenticated" in result.diagnostic ||
      "configuration" in result.diagnostic);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-5 rounded-2xl border p-5 ${
        success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {success ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-green-700" size={22} />
        ) : (
          <CircleAlert className="mt-0.5 shrink-0 text-red-700" size={22} />
        )}

        <div className="min-w-0">
          <p
            className={`font-bold ${
              success ? "text-green-800" : "text-red-800"
            }`}
          >
            {result.title}
          </p>

          <p className="mt-1 break-words text-sm leading-6 text-gray-700">
            {result.message}
          </p>

          {result.recipient && (
            <p className="mt-2 text-xs text-green-800">
              Recipient: {result.recipient}
            </p>
          )}
        </div>
      </div>

      {hasSmtpDiagnostics ? (
        <SmtpDiagnostics diagnostic={result.diagnostic} />
      ) : (
        <DiagnosticPanel diagnostic={result.diagnostic} />
      )}
    </div>
  );
}

export default function EmailTest() {
  const [email, setEmail] = useState("");
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [smtpResult, setSmtpResult] = useState(null);
  const [emailResult, setEmailResult] = useState(null);

  const testSmtp = async () => {
    setSmtpLoading(true);
    setSmtpResult(null);

    try {
      const response = await fetch(`${API_URL}/test-smtp`);
      const data = await response.json();

      const diagnostic = data.diagnostics || data.diagnostic || null;

      setSmtpResult({
        type: response.ok ? "success" : "error",
        title: response.ok
          ? "SMTP connection successful!"
          : "SMTP connection failed",
        message: data.message || "Unable to verify SMTP connection.",
        diagnostic,
      });
    } catch (error) {
      setSmtpResult({
        type: "error",
        title: "Backend connection failed",
        message:
          error.message || "Unable to communicate with the Cozy Home backend.",
      });
    } finally {
      setSmtpLoading(false);
    }
  };

  const sendTestEmail = async (event) => {
    event.preventDefault();

    setEmailLoading(true);
    setEmailResult(null);

    try {
      const response = await fetch(`${API_URL}/test-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      setEmailResult({
        type: response.ok ? "success" : "error",
        title: response.ok
          ? "Email sent successfully!"
          : "Email delivery failed",
        message: data.message || "Unable to send the test email.",
        recipient: data.recipient,
        diagnostic: data.diagnostic || null,
      });
    } catch (error) {
      setEmailResult({
        type: "error",
        title: "Backend connection failed",
        message:
          error.message || "Unable to communicate with the Cozy Home backend.",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const busy = smtpLoading || emailLoading;

  return (
    <main className="min-h-screen bg-cozy-cream px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-cozy-brown transition hover:text-cozy-sage-dark"
        >
          <ArrowLeft size={17} />
          Back to Cozy Home
        </Link>

        <div className="overflow-hidden rounded-3xl border border-[#e7dfd1] bg-cozy-paper shadow-sm">
          <div className="bg-cozy-dark px-7 py-8 text-cozy-paper sm:px-10">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Mail size={24} />
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#c8d1bd]">
              Cozy Home Developer Tools
            </p>

            <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
              Email diagnostics
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
              Diagnose your Gmail SMTP connection and test email delivery
              directly from your Cozy Home backend.
            </p>
          </div>

          <div className="p-7 sm:p-10">
            <div className="mb-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-cozy-cream p-4">
                <Server className="mb-3 text-cozy-sage-dark" size={21} />
                <p className="text-xs text-cozy-brown">Backend</p>
                <p className="mt-1 text-sm font-bold text-cozy-dark">
                  Express API
                </p>
              </div>

              <div className="rounded-2xl bg-cozy-cream p-4">
                <ShieldCheck className="mb-3 text-cozy-sage-dark" size={21} />
                <p className="text-xs text-cozy-brown">Email service</p>
                <p className="mt-1 text-sm font-bold text-cozy-dark">
                  Gmail SMTP
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-[#e7dfd1] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cozy-cream text-cozy-sage-dark">
                  <Wifi size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-cozy-dark">
                    SMTP connection test
                  </h2>
                  <p className="text-xs text-cozy-brown">
                    Test connection and Gmail authentication separately
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={testSmtp}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cozy-sage-dark bg-white px-5 py-3.5 text-sm font-bold text-cozy-sage-dark transition hover:bg-cozy-cream disabled:cursor-not-allowed disabled:opacity-50"
              >
                {smtpLoading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Checking SMTP...
                  </>
                ) : (
                  <>
                    <RefreshCw size={17} />
                    Test SMTP connection
                  </>
                )}
              </button>

              <TestResult result={smtpResult} />
            </section>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#e7dfd1]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-cozy-brown">
                Email delivery
              </span>
              <div className="h-px flex-1 bg-[#e7dfd1]" />
            </div>

            <section className="rounded-2xl border border-[#e7dfd1] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cozy-cream text-cozy-sage-dark">
                  <Send size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-cozy-dark">
                    Send a test email
                  </h2>
                  <p className="text-xs text-cozy-brown">
                    Send a real message through Gmail SMTP
                  </p>
                </div>
              </div>

              <form onSubmit={sendTestEmail} className="space-y-5">
                <div>
                  <label
                    htmlFor="recipient"
                    className="mb-2 block text-sm font-semibold text-cozy-dark"
                  >
                    Recipient email address
                  </label>

                  <input
                    id="recipient"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="example@gmail.com"
                    required
                    disabled={busy}
                    className="w-full rounded-xl border border-[#ded5c5] bg-white px-4 py-3.5 text-sm text-cozy-dark outline-none transition placeholder:text-[#b3a99a] focus:border-cozy-sage-dark focus:ring-4 focus:ring-cozy-sage/20 disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy || !email.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cozy-sage-dark px-5 py-3.5 text-sm font-bold text-white transition hover:bg-cozy-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {emailLoading ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      Sending email...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Send test email
                    </>
                  )}
                </button>
              </form>

              <TestResult result={emailResult} />
            </section>

            <div className="mt-7 rounded-xl bg-cozy-cream p-4">
              <div className="flex items-start gap-2">
                <Info
                  className="mt-0.5 shrink-0 text-cozy-sage-dark"
                  size={17}
                />

                <div>
                  <p className="text-xs font-bold text-cozy-dark">
                    Recommended testing order
                  </p>
                  <p className="mt-1 text-xs leading-5 text-cozy-brown">
                    First test the SMTP connection. Check both connection
                    results and runtime configuration. Then try sending an
                    actual email.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-7 text-center text-xs leading-5 text-cozy-brown">
              Development testing only. This page should not be publicly
              accessible in production.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-cozy-brown/70">
          Made with care by Cozy Home
        </p>
      </div>
    </main>
  );
}
