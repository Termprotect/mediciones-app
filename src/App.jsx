import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { loadData, saveData, SEED_DATA } from "./lib/utils";
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import DirectorLayout from "./pages/director/DirectorLayout";
import DirectorDashboard from "./pages/director/DirectorDashboard";
import CalendarioPage from "./pages/director/CalendarioPage";
import JornadasPage from "./pages/director/JornadasPage";
import MedidoresPage from "./pages/director/MedidoresPage";
import LogisticaLayout from "./pages/logistica/LogisticaLayout";
import LogisticaDashboardNew from "./pages/logistica/LogisticaDashboardNew";
import LogisticaCalendarioPage from "./pages/logistica/LogisticaCalendarioPage";
import ReprogramarPage from "./pages/logistica/ReprogramarPage";
import AprobacionesPage from "./pages/logistica/AprobacionesPage";
import MedicionesPage from "./pages/shared/MedicionesPage";
import MedidorLayout from "./pages/medidor/MedidorLayout";
import MedidorDashboardNew from "./pages/medidor/MedidorDashboardNew";
import MedidorCalendarioPage from "./pages/medidor/MedidorCalendarioPage";
import MedidorRouteView from "./pages/medidor/MedidorRouteView";
import MeasurementForm from "./components/measurement/MeasurementForm";
import RouteEditor from "./components/routes/RouteEditor";
import MeasurementDetailView from "./components/measurement/MeasurementDetailView";
// Admin pages (rendered inside DirectorLayout)
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import CatalogPage from "./pages/admin/CatalogPage";
import CitiesPage from "./pages/admin/CitiesPage";
import ComercialesPage from "./pages/admin/ComercialesPage";
import SettingsPage from "./pages/admin/SettingsPage";
import AuditPage from "./pages/admin/AuditPage";

const ADMIN_PAGE_MAP = {
  usuarios: UsersPage,
  catalogo: CatalogPage,
  ciudades: CitiesPage,
  comerciales: ComercialesPage,
  configuracion: SettingsPage,
};

export default function App() {
  const { user, logout: authLogout, loading } = useAuth();

  // State
  const [routes, setRoutes] = useState([]);
  const [view, setView] = useState("login");
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [createCity, setCreateCity] = useState(null);
  const [createDate, setCreateDate] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [directorPage, setDirectorPage] = useState("dashboard");
  const [logisticaPage, setLogisticaPage] = useState("dashboard");
  const [medidorPage, setMedidorPage] = useState("dashboard");

  // Helper to get dashboard view based on role
  const getDashView = () => {
    if (!user) return "login";
    if (user.role === "admin" || user.role === "director") return "director_dash";
    if (user.role === "logistica") return "logistica_dash";
    if (user.role === "medidor") return "medidor_dash";
    return "login";
  };

  // Load data on mount
  useEffect(() => {
    const data = loadData();
    setRoutes(data.length ? data : SEED_DATA);
    setLoaded(true);
  }, []);

  // Save data when routes change (if loaded)
  useEffect(() => {
    if (loaded) {
      saveData(routes);
    }
  }, [routes, loaded]);

  // Set initial view when user changes
  useEffect(() => {
    if (user) {
      setView(getDashView());
      setDirectorPage("dashboard");
      setLogisticaPage("dashboard");
      setMedidorPage("dashboard");
    }
  }, [user]);

  // Logout handler
  const logout = () => {
    authLogout();
    setSelectedRouteId(null);
    setSelectedClientId(null);
    setView("login");
  };

  // Derived values
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  const selectedClient = selectedRoute?.clients.find(
    (c) => c.id === selectedClientId
  );

  // Route operations
  const saveRoute = (route) => {
    setRoutes((prev) => {
      const exists = prev.find((r) => r.id === route.id);
      return exists
        ? prev.map((r) => (r.id === route.id ? route : r))
        : [...prev, route];
    });
    setSelectedRouteId(null);
    setView(getDashView());
  };

  const deleteRoute = (id) => {
    setRoutes(routes.filter((r) => r.id !== id));
    setSelectedRouteId(null);
    setView(getDashView());
  };

  const saveMeasurement = (clientId, routeId, measurement) => {
    setRoutes(
      routes.map((route) => {
        if (route.id === routeId) {
          const updatedClients = route.clients.map((client) => {
            if (client.id === clientId) {
              return {
                ...client,
                measurement,
                measurementApproval: {
                  status: "pendiente_aprobacion",
                  submittedAt: new Date().toISOString(),
                  submittedBy: user?.id,
                  approvedAt: null,
                  approvedBy: null,
                  emailSent: false,
                },
              };
            }
            return client;
          });
          const allActiveHaveMeasurements = updatedClients
            .filter((c) => c.status !== "reprogramar")
            .every((c) => c.measurement);
          const newStatus = allActiveHaveMeasurements
            ? "completado"
            : "en_progreso";
          return { ...route, clients: updatedClients, status: newStatus };
        }
        return route;
      })
    );
    setSelectedClientId(null);
    setView("medidor_route");
  };

  const approveMeasurement = (clientId, routeId) => {
    setRoutes(
      routes.map((route) => {
        if (route.id === routeId) {
          const updatedClients = route.clients.map((client) => {
            if (client.id === clientId) {
              return {
                ...client,
                measurementApproval: {
                  ...client.measurementApproval,
                  status: "aprobado",
                  approvedAt: new Date().toISOString(),
                  approvedBy: user?.id,
                },
              };
            }
            return client;
          });
          return { ...route, clients: updatedClients };
        }
        return route;
      })
    );
  };

  const updateClientMeasurement = (clientId, routeId, measurement) => {
    setRoutes(
      routes.map((route) => {
        if (route.id === routeId) {
          const updatedClients = route.clients.map((client) => {
            if (client.id === clientId) {
              return { ...client, measurement };
            }
            return client;
          });
          return { ...route, clients: updatedClients };
        }
        return route;
      })
    );
  };

  const rescheduleClient = (clientId, routeId, note) => {
    setRoutes(
      routes.map((route) => {
        if (route.id === routeId) {
          const updatedClients = route.clients.map((client) => {
            if (client.id === clientId) {
              return { ...client, status: "reprogramar", rescheduleNote: note };
            }
            return client;
          });
          return { ...route, clients: updatedClients };
        }
        return route;
      })
    );
  };

  const reassignClient = (clientId, fromRouteId, targetRouteId) => {
    setRoutes((prev) => {
      // Find the client in the source route
      const sourceRoute = prev.find((r) => r.id === fromRouteId);
      if (!sourceRoute) return prev;
      const clientData = sourceRoute.clients.find((c) => c.id === clientId);
      if (!clientData) return prev;

      // Prepare the reassigned client — reset measurement state, keep identity
      const reassignedClient = {
        ...clientData,
        status: "pendiente",
        rescheduleNote: "",
        measurement: null,
        measurementApproval: null,
      };

      return prev.map((route) => {
        if (route.id === fromRouteId) {
          // Mark client as "reprogramado" in original route (keeps history)
          const updatedClients = route.clients.map((c) =>
            c.id === clientId ? { ...c, status: "reprogramado" } : c
          );
          return { ...route, clients: updatedClients };
        }
        if (route.id === targetRouteId) {
          // Add the client to the target route
          return { ...route, clients: [...route.clients, reassignedClient] };
        }
        return route;
      });
    });
  };

  // Count pending notifications (rescheduled items)
  const notifications = routes.reduce(
    (sum, r) => sum + r.clients.filter((c) => c.status === "reprogramar").length,
    0
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Change password view
  if (view === "change_password") {
    return <ChangePasswordPage onBack={() => setView(getDashView())} />;
  }

  // Shared handler for viewing measurement detail
  const handleViewMeasurement = (clientId, routeId) => {
    setSelectedRouteId(routeId);
    setSelectedClientId(clientId);
    setView("measurement_detail");
  };

  // ─── ADMIN / DIRECTOR ───
  if (user.role === "admin" || user.role === "director") {
    // Measurement detail view (full screen)
    if (view === "measurement_detail" && selectedRouteId && selectedClientId) {
      const detailRoute = routes.find((r) => r.id === selectedRouteId);
      const detailClient = detailRoute?.clients.find((c) => c.id === selectedClientId);
      if (detailRoute && detailClient) {
        return (
          <MeasurementDetailView
            client={detailClient}
            route={detailRoute}
            onBack={() => {
              setSelectedClientId(null);
              setSelectedRouteId(null);
              setView("director_dash");
            }}
          />
        );
      }
    }

    // Route editor (full screen, no sidebar)
    if (view === "route_edit" && selectedRouteId) {
      return (
        <RouteEditor
          route={selectedRoute}
          city={selectedRoute?.city}
          onSave={saveRoute}
          onBack={() => {
            setView("director_dash");
            setSelectedRouteId(null);
          }}
          onDelete={deleteRoute}
        />
      );
    }

    if (view === "route_create") {
      return (
        <RouteEditor
          route={null}
          city={createCity}
          initialDate={createDate}
          onSave={saveRoute}
          onBack={() => setView("director_dash")}
        />
      );
    }

    // Sidebar navigation handler
    const handleNavigate = (page) => {
      setDirectorPage(page);
    };

    // Shared route action handlers
    const routeActions = {
      onCreateRoute: (city, date) => {
        setCreateCity(city);
        setCreateDate(date || null);
        setView("route_create");
      },
      onEditRoute: (id) => {
        setSelectedRouteId(id);
        setView("route_edit");
      },
    };

    // Determine which content to render
    let pageContent;
    switch (directorPage) {
      case "calendario":
        pageContent = (
          <CalendarioPage routes={routes} onEditRoute={routeActions.onEditRoute} onCreateRoute={routeActions.onCreateRoute} />
        );
        break;
      case "jornadas":
        pageContent = (
          <JornadasPage
            routes={routes}
            onCreateRoute={routeActions.onCreateRoute}
            onEditRoute={routeActions.onEditRoute}
          />
        );
        break;
      case "mediciones":
        pageContent = <MedicionesPage routes={routes} onViewMeasurement={handleViewMeasurement} />;
        break;
      case "medidores":
        pageContent = <MedidoresPage routes={routes} />;
        break;
      case "aprobaciones":
        pageContent = (
          <AprobacionesPage
            routes={routes}
            onApproveMeasurement={approveMeasurement}
            onUpdateMeasurement={updateClientMeasurement}
            filterByCity={null}
          />
        );
        break;
      case "reprogramaciones":
        pageContent = (
          <ReprogramarPage
            routes={routes}
            onReassignClient={reassignClient}
            filterByCity={null}
          />
        );
        break;
      // Admin pages
      case "usuarios":
        pageContent = <UsersPage />;
        break;
      case "catalogo":
        pageContent = <CatalogPage />;
        break;
      case "ciudades":
        pageContent = <CitiesPage />;
        break;
      case "comerciales":
        pageContent = <ComercialesPage />;
        break;
      case "configuracion":
        pageContent = <SettingsPage />;
        break;
      case "dashboard":
      default:
        pageContent = (
          <DirectorDashboard
            routes={routes}
            onCreateRoute={routeActions.onCreateRoute}
            onEditRoute={routeActions.onEditRoute}
          />
        );
        break;
    }

    return (
      <DirectorLayout
        activePage={directorPage}
        onNavigate={handleNavigate}
        isAdmin={user.role === "admin"}
        notifications={notifications}
      >
        {pageContent}
      </DirectorLayout>
    );
  }

  // ─── LOGISTICA ───
  if (user.role === "logistica") {
    // Measurement detail view (full screen)
    if (view === "measurement_detail" && selectedRouteId && selectedClientId) {
      const detailRoute = routes.find((r) => r.id === selectedRouteId);
      const detailClient = detailRoute?.clients.find((c) => c.id === selectedClientId);
      if (detailRoute && detailClient) {
        return (
          <MeasurementDetailView
            client={detailClient}
            route={detailRoute}
            onBack={() => {
              setSelectedClientId(null);
              setSelectedRouteId(null);
              setView("logistica_dash");
            }}
          />
        );
      }
    }

    if (view === "route_edit" && selectedRouteId) {
      return (
        <RouteEditor
          route={selectedRoute}
          city={user.city}
          onSave={saveRoute}
          onBack={() => {
            setView("logistica_dash");
            setSelectedRouteId(null);
          }}
          onDelete={deleteRoute}
        />
      );
    }

    if (view === "route_create") {
      return (
        <RouteEditor
          route={null}
          city={user.city}
          initialDate={createDate}
          onSave={saveRoute}
          onBack={() => setView("logistica_dash")}
        />
      );
    }

    const logisticaRouteActions = {
      onCreateRoute: (date) => {
        setCreateDate(date || null);
        setView("route_create");
      },
      onEditRoute: (id) => {
        setSelectedRouteId(id);
        setView("route_edit");
      },
    };

    let logisticaContent;
    switch (logisticaPage) {
      case "calendario":
        logisticaContent = (
          <LogisticaCalendarioPage routes={routes} onEditRoute={logisticaRouteActions.onEditRoute} onCreateRoute={logisticaRouteActions.onCreateRoute} />
        );
        break;
      case "jornadas":
        logisticaContent = (
          <JornadasPage
            routes={routes.filter((r) => r.city === user.city)}
            onCreateRoute={logisticaRouteActions.onCreateRoute}
            onEditRoute={logisticaRouteActions.onEditRoute}
          />
        );
        break;
      case "mediciones":
        logisticaContent = (
          <MedicionesPage routes={routes} filterByCity={user.city} onViewMeasurement={handleViewMeasurement} />
        );
        break;
      case "aprobaciones":
        logisticaContent = (
          <AprobacionesPage
            routes={routes}
            onApproveMeasurement={approveMeasurement}
            onUpdateMeasurement={updateClientMeasurement}
          />
        );
        break;
      case "reprogramar":
        logisticaContent = (
          <ReprogramarPage routes={routes} onReassignClient={reassignClient} />
        );
        break;
      case "dashboard":
      default:
        logisticaContent = (
          <LogisticaDashboardNew
            routes={routes}
            onCreateRoute={logisticaRouteActions.onCreateRoute}
            onEditRoute={logisticaRouteActions.onEditRoute}
          />
        );
        break;
    }

    return (
      <LogisticaLayout
        activePage={logisticaPage}
        onNavigate={setLogisticaPage}
        notifications={routes.reduce(
          (sum, r) => r.city === user.city ? sum + r.clients.filter((c) => c.status === "reprogramar").length : sum, 0
        )}
        approvalCount={routes.reduce(
          (sum, r) => r.city === user.city ? sum + r.clients.filter((c) => c.measurementApproval?.status === "pendiente_aprobacion").length : sum, 0
        )}
      >
        {logisticaContent}
      </LogisticaLayout>
    );
  }

  // ─── MEDIDOR ───
  if (user.role === "medidor") {
    if (view === "medidor_measure" && selectedClient) {
      return (
        <MeasurementForm
          client={selectedClient}
          onBack={() => {
            setSelectedClientId(null);
            setView("medidor_route");
          }}
          onSave={(m) => saveMeasurement(selectedClientId, selectedRouteId, m)}
        />
      );
    }

    if (view === "medidor_route" && selectedRoute) {
      return (
        <MedidorRouteView
          route={selectedRoute}
          onBack={() => {
            setSelectedRouteId(null);
            setView("medidor_dash");
          }}
          onSelectClient={(id) => {
            setSelectedClientId(id);
            setView("medidor_measure");
          }}
          onReschedule={(clientId, routeIdIgnored, note) => {
            rescheduleClient(clientId, selectedRouteId, note);
          }}
        />
      );
    }

    const medidorSelectRoute = (id) => {
      setSelectedRouteId(id);
      setView("medidor_route");
    };

    let medidorContent;
    switch (medidorPage) {
      case "calendario":
        medidorContent = (
          <MedidorCalendarioPage routes={routes} onSelectRoute={medidorSelectRoute} />
        );
        break;
      case "dashboard":
      default:
        medidorContent = (
          <MedidorDashboardNew routes={routes} onSelectRoute={medidorSelectRoute} />
        );
        break;
    }

    return (
      <MedidorLayout
        activePage={medidorPage}
        onNavigate={setMedidorPage}
      >
        {medidorContent}
      </MedidorLayout>
    );
  }

  // Fallback
  return <LoginPage />;
}
