"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    Calendar as CalendarIcon,
    LogOut,
    Clock,
    CheckCircle,
    XCircle,
    User,
    Mail,
    Phone,
    DollarSign,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format, parseISO, isPast, isFuture, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface Appointment {
    id: string;
    client_name: string;
    client_email: string;
    client_phone: string | null;
    datetime: string;
    status: string;
    payment_status: string;
    service: {
        name: string;
        price: number;
        duration_minutes: number;
    };
}

export default function ProfessionalDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [professional, setProfessional] = useState<any>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            router.push("/professional/login");
            return;
        }

        await loadData(session.user.id);
    };

    const loadData = async (userId: string) => {
        try {
            // Get professional profiles (puede haber múltiples)
            const { data: profDataArray, error: profError } = await supabase
                .from("professionals")
                .select("*")
                .eq("user_id", userId);

            if (profError) {
                console.error("Error fetching profile:", profError);
                return;
            }

            // Si no existe ningún perfil, crear uno
            if (!profDataArray || profDataArray.length === 0) {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                const { data: newProf, error: insertError } = await supabase
                    .from("professionals")
                    .insert({
                        user_id: userId,
                        name: user?.email?.split("@")[0] || "Profesional",
                        email: user?.email || "",
                        specialty: "Especialidad por definir",
                        bio: "Completa tu perfil para comenzar",
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error("Error creating profile:", insertError);
                    alert("Error al crear el perfil. Por favor contacta a soporte.");
                    return;
                }

                setProfessional(newProf);
                setAppointments([]);
                setLoading(false);
                return;
            }

            // Si hay múltiples perfiles, usar el primero (o el que tenga más datos)
            const profData = profDataArray.length > 1
                ? profDataArray.find(p => p.specialty !== "Especialidad por definir") || profDataArray[0]
                : profDataArray[0];

            setProfessional(profData);

            // Get appointments
            if (profData?.id) {
                const { data: appointmentsData } = await supabase
                    .from("appointments")
                    .select(
                        `
          *,
          service:services(name, price, duration_minutes)
        `
                    )
                    .eq("professional_id", profData.id)
                    .order("datetime", { ascending: true });

                setAppointments(appointmentsData || []);
            } else {
                setAppointments([]);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            alert("Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const updateAppointmentStatus = async (
        appointmentId: string,
        newStatus: string
    ) => {
        try {
            const { error } = await supabase
                .from("appointments")
                .update({ status: newStatus })
                .eq("id", appointmentId);

            if (error) throw error;

            // Refresh appointments
            setAppointments(
                appointments.map((apt) =>
                    apt.id === appointmentId ? { ...apt, status: newStatus } : apt
                )
            );
        } catch (error) {
            console.error("Error updating appointment:", error);
            alert("Error al actualizar la cita");
        }
    };

    const getFilteredAppointments = () => {
        const now = new Date();
        return appointments.filter((apt) => {
            const aptDate = parseISO(apt.datetime);
            if (filter === "upcoming") return isFuture(aptDate) || isToday(aptDate);
            if (filter === "past") return isPast(aptDate) && !isToday(aptDate);
            return true;
        });
    };

    const getStats = () => {
        const now = new Date();
        const upcoming = appointments.filter((apt) => isFuture(parseISO(apt.datetime)));
        const today = appointments.filter((apt) => isToday(parseISO(apt.datetime)));
        const confirmed = appointments.filter((apt) => apt.status === "confirmed");
        const totalRevenue = appointments
            .filter((apt) => apt.payment_status === "paid")
            .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

        return { upcoming: upcoming.length, today: today.length, confirmed: confirmed.length, totalRevenue };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = getStats();
    const filteredAppointments = getFilteredAppointments();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-white" />
                        </div>
                        <span>BookFlow</span>
                        <span className="text-sm font-normal text-gray-500">/ Dashboard</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </motion.button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">
                        Bienvenido, {professional?.name}
                    </h1>
                    <p className="text-gray-600">{professional?.specialty}</p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <CalendarIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Próximas citas</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Clock className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Hoy</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Confirmadas</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.confirmed}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Ingresos</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(stats.totalRevenue)}
                        </p>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-6">
                    {[
                        { value: "upcoming", label: "Próximas" },
                        { value: "past", label: "Pasadas" },
                        { value: "all", label: "Todas" },
                    ].map((f) => (
                        <motion.button
                            key={f.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(f.value as any)}
                            className={`px-6 py-2 rounded-xl font-medium transition-all ${filter === f.value
                                ? "bg-purple-600 text-white"
                                : "bg-white border border-gray-200 text-gray-700 hover:border-purple-200"
                                }`}
                        >
                            {f.label}
                        </motion.button>
                    ))}
                </div>

                {/* Appointments List */}
                <div className="space-y-4">
                    {filteredAppointments.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No hay citas para mostrar</p>
                        </div>
                    ) : (
                        filteredAppointments.map((appointment, index) => {
                            const aptDate = parseISO(appointment.datetime);
                            const isUpcoming = isFuture(aptDate);

                            return (
                                <motion.div
                                    key={appointment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold mb-1">
                                                        {appointment.client_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {appointment.service?.name}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status === "confirmed"
                                                        ? "bg-green-100 text-green-700"
                                                        : appointment.status === "cancelled"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >
                                                    {appointment.status === "confirmed"
                                                        ? "Confirmada"
                                                        : appointment.status === "cancelled"
                                                            ? "Cancelada"
                                                            : "Pendiente"}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    <span>
                                                        {format(aptDate, "EEEE, d 'de' MMMM", { locale: es })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{format(aptDate, "HH:mm")}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail className="h-4 w-4" />
                                                    <span>{appointment.client_email}</span>
                                                </div>
                                                {appointment.client_phone && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{appointment.client_phone}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span className="font-semibold">
                                                        {formatCurrency(appointment.service?.price || 0)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <User className="h-4 w-4" />
                                                    <span>{appointment.service?.duration_minutes} minutos</span>
                                                </div>
                                            </div>
                                        </div>

                                        {isUpcoming && appointment.status === "pending" && (
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() =>
                                                        updateAppointmentStatus(appointment.id, "confirmed")
                                                    }
                                                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Confirmar
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() =>
                                                        updateAppointmentStatus(appointment.id, "cancelled")
                                                    }
                                                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Cancelar
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}