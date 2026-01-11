"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar } from "@/components/calendar";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ArrowLeft, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface Service {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: number;
}



export default function BookingProfessionalPage({
    params,
}: {
    params: Promise<{ professionalId: string }>;
}) {
    const { professionalId } = use(params);
    const [professional, setProfessional] = useState<any>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const availableDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i + 1));

    const timeSlots = Array.from({ length: 18 }, (_, i) => {
        const hour = Math.floor(9 + i / 2);
        const minute = i % 2 === 0 ? 0 : 30;
        return format(setMinutes(setHours(new Date(), hour), minute), "HH:mm");
    });

    useEffect(() => {
        async function loadData() {
            const { data: profData } = await supabase
                .from("professionals")
                .select("*")
                .eq("id", professionalId)
                .single();

            const { data: servicesData } = await supabase
                .from("services")
                .select("*")
                .eq("professional_id", professionalId);

            setProfessional(profData);
            setServices(servicesData || []);
            setLoading(false);
        }

        loadData();
    }, [professionalId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-600">Cargando...</p>
                </motion.div>
            </div>
        );
    }

    if (!professional) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <p className="text-gray-600 mb-4">Profesional no encontrado</p>
                    <Link href="/booking" className="text-purple-600 hover:underline">
                        Volver a la lista
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar animado */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90"
            >
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white"
                        >
                            <CalendarIcon className="h-5 w-5" />
                        </motion.div>
                        <span>BookFlow</span>
                    </Link>
                    <Link
                        href="/booking"
                        className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-medium">Volver</span>
                    </Link>
                </div>
            </motion.nav>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left - Professional Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-3xl font-bold text-white mb-4"
                            >
                                {professional.name.charAt(0)}
                            </motion.div>
                            <h2 className="text-2xl font-bold mb-2">{professional.name}</h2>
                            <p className="text-gray-600 mb-4">{professional.specialty}</p>
                            {professional.bio && (
                                <p className="text-sm text-gray-600">{professional.bio}</p>
                            )}
                        </div>

                        {/* Services */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <h3 className="font-bold mb-4">Servicios disponibles</h3>
                            <div className="space-y-3">
                                {services.map((service, index) => (
                                    <motion.button
                                        key={service.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedService(service)}
                                        className={`w-full text-left p-4 border-2 rounded-xl transition-all ${selectedService?.id === service.id
                                            ? "border-purple-600 bg-purple-50 shadow-lg shadow-purple-100"
                                            : "border-gray-200 hover:border-purple-200"
                                            }`}
                                    >
                                        <div className="font-semibold mb-1">{service.name}</div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {service.duration_minutes} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                {formatCurrency(service.price)}
                                            </span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right - Calendar & Time Selection */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <AnimatePresence mode="wait">
                            {!selectedService ? (
                                <motion.div
                                    key="no-service"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white border border-gray-200 rounded-2xl p-12 text-center"
                                >
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    </motion.div>
                                    <h3 className="text-xl font-bold mb-2">Selecciona un servicio</h3>
                                    <p className="text-gray-600">
                                        Elige un servicio para ver la disponibilidad
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="has-service"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <Calendar
                                        selectedDate={selectedDate}
                                        onSelectDate={setSelectedDate}
                                        availableDates={availableDates}
                                    />

                                    <AnimatePresence>
                                        {selectedDate && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="bg-white border border-gray-200 rounded-2xl p-6"
                                            >
                                                <h3 className="font-bold mb-4">
                                                    Horarios disponibles -{" "}
                                                    {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                                                </h3>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                                    {timeSlots.map((time, index) => (
                                                        <motion.button
                                                            key={time}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: index * 0.02 }}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setSelectedTime(time)}
                                                            className={`py-3 px-4 rounded-xl font-medium transition-all ${selectedTime === time
                                                                ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                                                                : "bg-gray-50 hover:bg-gray-100"
                                                                }`}
                                                        >
                                                            {time}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <AnimatePresence>
                                        {selectedDate && selectedTime && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                            >
                                                <Link
                                                    href={`/booking/${professionalId}/confirm?service=${selectedService.id}&date=${selectedDate.toISOString()}&time=${selectedTime}`}
                                                    className="block w-full py-4 bg-purple-600 text-white text-center font-semibold rounded-2xl hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all"
                                                >
                                                    Continuar con la reserva
                                                </Link>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}