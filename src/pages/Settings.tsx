import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings as SettingsIcon, ChevronRight } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const TABS = ["General", "Account", "Privacy", "Billing", "Capabilities", "Connectors"];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("General");
  const [fullName, setFullName] = useState("Mehraf");
  const [callName, setCallName] = useState("Mehraf");
  const [preferences, setPreferences] = useState("");
  const [notifResponse, setNotifResponse] = useState(false);
  const [notifDispatch, setNotifDispatch] = useState(false);
  const { theme, setTheme, resolved } = useTheme();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-y-auto scrollbar-thin">
          {/* Back button */}
          <div className="px-6 pt-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans-body"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to chat
            </button>
          </div>

          <div className="px-6 pt-6 pb-16 max-w-4xl w-full mx-auto">
            <h1 className="text-2xl font-semibold text-foreground mb-8 font-sans">Settings</h1>

            <div className="flex gap-8">
              {/* Sidebar tabs */}
              <nav className="w-48 shrink-0">
                <ul className="space-y-1">
                  {TABS.map((tab) => (
                    <li key={tab}>
                      <button
                        onClick={() => setActiveTab(tab)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-sans-body transition-colors ${
                          activeTab === tab
                            ? "bg-secondary text-foreground font-medium"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        }`}
                      >
                        {tab}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {activeTab === "General" && (
                  <div className="space-y-8">
                    {/* Profile */}
                    <section>
                      <h2 className="text-lg font-semibold text-foreground mb-4 font-sans">Profile</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm text-muted-foreground font-sans-body mb-2 block">
                            Full name
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <input
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-sans-body focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground font-sans-body mb-2 block">
                            What should AI call you?
                          </label>
                          <input
                            value={callName}
                            onChange={(e) => setCallName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-sans-body focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="text-sm text-muted-foreground font-sans-body mb-1 block">
                          What best describes your work?
                        </label>
                        <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-sans-body focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                          <option>Select your work function</option>
                          <option>Engineering</option>
                          <option>Research</option>
                          <option>Product</option>
                          <option>Design</option>
                          <option>Marketing</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className="mt-6">
                        <label className="text-sm text-primary font-sans-body mb-1 block">
                          What personal preferences should AI consider in responses?
                        </label>
                        <p className="text-xs text-muted-foreground font-sans-body mb-2">
                          Your preferences will apply to all conversations.
                        </p>
                        <textarea
                          value={preferences}
                          onChange={(e) => setPreferences(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-sans-body focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          placeholder="e.g., Be concise, use technical language..."
                        />
                      </div>
                    </section>

                    <Separator />

                    {/* Notifications */}
                    <section>
                      <h2 className="text-lg font-semibold text-foreground mb-4 font-sans">Notifications</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground font-sans-body">Response completions</p>
                            <p className="text-xs text-muted-foreground font-sans-body">
                              Get notified when AI has finished a response.
                            </p>
                          </div>
                          <Switch checked={notifResponse} onCheckedChange={setNotifResponse} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground font-sans-body">Dispatch messages</p>
                            <p className="text-xs text-muted-foreground font-sans-body">
                              Get a push notification when AI messages you.
                            </p>
                          </div>
                          <Switch checked={notifDispatch} onCheckedChange={setNotifDispatch} />
                        </div>
                      </div>
                    </section>

                    <Separator />

                    {/* Appearance */}
                    <section>
                      <h2 className="text-lg font-semibold text-foreground mb-2 font-sans">Appearance</h2>
                      <p className="text-sm text-muted-foreground font-sans-body mb-4">Color mode</p>
                      <div className="grid grid-cols-3 gap-4 max-w-md">
                        {(["light", "auto", "dark"] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setTheme(mode)}
                            className={`rounded-xl border-2 p-1 transition-all ${
                              theme === mode
                                ? "border-primary"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            <div
                              className={`rounded-lg aspect-[4/3] flex flex-col justify-between p-3 ${
                                mode === "dark"
                                  ? "bg-[hsl(220,13%,8%)]"
                                  : mode === "light"
                                  ? "bg-[hsl(30,20%,96%)]"
                                  : "bg-gradient-to-r from-[hsl(30,20%,96%)] from-50% to-[hsl(220,13%,8%)] to-50%"
                              }`}
                            >
                              <div className="space-y-1">
                                <div
                                  className={`h-1.5 w-3/4 rounded-full ${
                                    mode === "dark" ? "bg-white/20" : mode === "light" ? "bg-black/15" : "bg-black/15"
                                  }`}
                                />
                                <div
                                  className={`h-1.5 w-1/2 rounded-full ${
                                    mode === "dark" ? "bg-white/10" : mode === "light" ? "bg-black/10" : "bg-black/10"
                                  }`}
                                />
                              </div>
                              <div className="flex justify-end">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              </div>
                            </div>
                            <p className="text-xs text-center mt-2 text-foreground font-sans-body capitalize">
                              {mode}
                            </p>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {activeTab !== "General" && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <SettingsIcon className="h-10 w-10 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-sans-body text-sm">
                      {activeTab} settings coming soon
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
