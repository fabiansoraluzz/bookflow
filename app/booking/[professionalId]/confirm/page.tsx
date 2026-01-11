"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ArrowLeft, Clock, DollarSign, User, Mail, Phone, CheckCircle, Loader2, Download, Home } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import jsPDF from "jspdf";

interface Service {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: number;
}

interface Professional {
    id: string;
    name: string;
    specialty: string;
    email: string;
}

interface Appointment {
    id: string;
    client_name: string;
    client_email: string;
    datetime: string;
}

export default function ConfirmBookingPage({
    params
}: {
    params: Promise<{ professionalId: string }>
}) {
    const { professionalId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();

    const serviceId = searchParams.get("service");
    const dateStr = searchParams.get("date");
    const time = searchParams.get("time");

    const [professional, setProfessional] = useState<Professional | null>(null);
    const [service, setService] = useState<Service | null>(null);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [formErrors, setFormErrors] = useState({
        name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        async function loadData() {
            if (!serviceId || !dateStr || !time) {
                router.push("/booking");
                return;
            }

            const { data: profData } = await supabase
                .from("professionals")
                .select("*")
                .eq("id", professionalId)
                .single();

            const { data: serviceData } = await supabase
                .from("services")
                .select("*")
                .eq("id", serviceId)
                .single();

            setProfessional(profData);
            setService(serviceData);
            setLoading(false);
        }

        loadData();
    }, [professionalId, serviceId, dateStr, time, router]);

    const validateForm = () => {
        const errors = { name: "", email: "", phone: "" };
        let isValid = true;

        if (!formData.name.trim()) {
            errors.name = "El nombre es requerido";
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = "El email es requerido";
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            errors.email = "Email inválido";
            isValid = false;
        }

        if (formData.phone && formData.phone.length < 9) {
            errors.phone = "Teléfono inválido";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const generatePDF = () => {
        if (!appointment || !professional || !service || !dateStr || !time) return;

        setDownloadingPDF(true);

        try {
            const doc = new jsPDF();
            const appointmentDate = parseISO(dateStr);

            // Colores del brand
            const primaryColor = [168, 85, 247]; // purple-600
            const textColor = [31, 41, 55]; // gray-800
            const lightGray = [243, 244, 246]; // gray-100

            // Header con gradiente simulado
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(0, 0, 210, 50, 'F');

            // Logo/Icono (simulado)
            doc.setFillColor(255, 255, 255);
            doc.circle(20, 20, 8, 'F');
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('B', 17, 23);

            // Título
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('BookFlow', 35, 23);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Confirmación de Reserva', 35, 32);

            // Sección: Información de la cita
            let yPos = 70;

            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.roundedRect(15, yPos - 10, 180, 12, 3, 3, 'F');

            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Detalles de la Cita', 20, yPos - 3);

            yPos += 15;

            // ID de reserva
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('ID de Reserva:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text(appointment.id.substring(0, 8).toUpperCase(), 60, yPos);
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);

            yPos += 10;

            // Cliente
            doc.setFont('helvetica', 'bold');
            doc.text('Cliente:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(appointment.client_name, 60, yPos);

            yPos += 8;

            doc.setFont('helvetica', 'bold');
            doc.text('Email:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(appointment.client_email, 60, yPos);

            yPos += 15;

            // Profesional
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.roundedRect(15, yPos - 10, 180, 12, 3, 3, 'F');

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Profesional', 20, yPos - 3);

            yPos += 15;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Nombre:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(professional.name, 60, yPos);

            yPos += 8;

            doc.setFont('helvetica', 'bold');
            doc.text('Especialidad:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(professional.specialty, 60, yPos);

            yPos += 15;

            // Servicio
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.roundedRect(15, yPos - 10, 180, 12, 3, 3, 'F');

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Servicio', 20, yPos - 3);

            yPos += 15;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Servicio:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(service.name, 60, yPos);

            yPos += 8;

            doc.setFont('helvetica', 'bold');
            doc.text('Duración:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(`${service.duration_minutes} minutos`, 60, yPos);

            yPos += 8;

            doc.setFont('helvetica', 'bold');
            doc.text('Precio:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(formatCurrency(service.price), 60, yPos);

            yPos += 15;

            // Fecha y hora
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.roundedRect(15, yPos - 10, 180, 12, 3, 3, 'F');

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Fecha y Hora', 20, yPos - 3);

            yPos += 15;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Fecha:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(format(appointmentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }), 60, yPos);

            yPos += 8;

            doc.setFont('helvetica', 'bold');
            doc.text('Hora:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFontSize(12);
            doc.text(time, 60, yPos);

            // Footer
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('BookFlow - Sistema de Reservas Profesional', 105, 280, { align: 'center' });
            doc.text(`Generado el ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`, 105, 285, { align: 'center' });

            // Guardar
            doc.save(`reserva-${appointment.id.substring(0, 8)}.pdf`);

            setDownloadingPDF(false);
        } catch (error) {
            console.error("Error generating PDF:", error);
            setDownloadingPDF(false);
            alert("Error al generar el PDF. Por favor intenta nuevamente.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        if (!service || !professional || !dateStr || !time) return;

        setSubmitting(true);
        setError(null);

        try {
            const appointmentDate = parseISO(dateStr);
            const [hours, minutes] = time.split(":");
            appointmentDate.setHours(parseInt(hours), parseInt(minutes));

            const { data, error: insertError } = await supabase
                .from("appointments")
                .insert({
                    client_name: formData.name,
                    client_email: formData.email,
                    client_phone: formData.phone || null,
                    service_id: service.id,
                    professional_id: professional.id,
                    datetime: appointmentDate.toISOString(),
                    status: "pending",
                    payment_status: "unpaid",
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Enviar emails de confirmación
            try {
                await fetch('/api/send-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientName: formData.name,
                        clientEmail: formData.email,
                        professionalName: professional.name,
                        professionalEmail: professional.email,
                        serviceName: service.name,
                        datetime: appointmentDate.toISOString(),
                        price: service.price,
                        appointmentId: data.id,
                    }),
                });
            } catch (emailError) {
                console.error('Error sending confirmation emails:', emailError);
                // No bloqueamos la reserva si falla el email
            }

            setAppointment(data);
            setSuccess(true);
        } catch (err: any) {
            console.error("Error creating appointment:", err);
            setError("Error al crear la cita. Por favor intenta nuevamente.");
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormErrors({ ...formErrors, [e.target.name]: "" });
    };

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

    if (!professional || !service || !dateStr || !time) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Información incompleta</p>
                    <Link href="/booking" className="text-purple-600 hover:underline">
                        Volver a reservar
                    </Link>
                </div>
            </div>
        );
    }

    const appointmentDate = parseISO(dateStr);

    return (
        <div className="min-h-screen bg-gray-50">
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
                    {!success && (
                        <Link
                            href={`/booking/${professionalId}`}
                            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-sm font-medium">Volver</span>
                        </Link>
                    )}
                </div>
            </motion.nav>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-white border border-gray-200 rounded-3xl p-12 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </motion.div>

                            <h2 className="text-3xl font-bold mb-4">¡Reserva confirmada!</h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Hemos enviado los detalles de tu cita a <strong>{formData.email}</strong>
                            </p>

                            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-left max-w-md mx-auto mb-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-purple-600" />
                                        <span className="font-medium">{professional.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="h-5 w-5 text-purple-600" />
                                        <span>{format(appointmentDate, "EEEE, d 'de' MMMM", { locale: es })}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-purple-600" />
                                        <span className="text-xl font-bold text-purple-600">{time}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={generatePDF}
                                    disabled={downloadingPDF}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white font-semibold rounded-2xl hover:bg-purple-700 transition-all disabled:opacity-50"
                                >
                                    {downloadingPDF ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Generando PDF...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-5 w-5" />
                                            Descargar PDF
                                        </>
                                    )}
                                </motion.button>

                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 font-semibold rounded-2xl hover:bg-gray-50 transition-all"
                                    >
                                        <Home className="h-5 w-5" />
                                        Volver al inicio
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-4xl font-bold mb-2">Confirma tu reserva</h1>
                                <p className="text-lg text-gray-600">
                                    Completa tus datos para finalizar la reserva
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="lg:col-span-1"
                                >
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 sticky top-24">
                                        <h3 className="font-bold text-lg">Resumen de la cita</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Profesional</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                                        {professional.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{professional.name}</p>
                                                        <p className="text-sm text-gray-600">{professional.specialty}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-px bg-gray-200" />

                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Servicio</p>
                                                <p className="font-medium">{service.name}</p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {service.duration_minutes} min
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        {formatCurrency(service.price)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="h-px bg-gray-200" />

                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Fecha y hora</p>
                                                <p className="font-medium">
                                                    {format(appointmentDate, "EEEE, d 'de' MMMM", { locale: es })}
                                                </p>
                                                <p className="text-purple-600 font-semibold mt-1">{time}</p>
                                            </div>

                                            <div className="h-px bg-gray-200" />

                                            <div className="bg-purple-50 rounded-xl p-4">
                                                <p className="text-sm text-gray-600 mb-1">Total a pagar</p>
                                                <p className="text-3xl font-bold text-purple-600">
                                                    {formatCurrency(service.price)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="lg:col-span-2"
                                >
                                    <div className="bg-white border border-gray-200 rounded-2xl p-8">
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium mb-2">
                                                    Nombre completo *
                                                </label>
                                                <motion.div whileFocus={{ scale: 1.01 }}>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-3 rounded-xl border ${formErrors.name ? "border-red-500" : "border-gray-300"
                                                            } focus:border-purple-600 focus:outline-none transition-colors`}
                                                        placeholder="Juan Pérez"
                                                    />
                                                </motion.div>
                                                {formErrors.name && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-red-500 text-sm mt-1"
                                                    >
                                                        {formErrors.name}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                                    Email *
                                                </label>
                                                <motion.div whileFocus={{ scale: 1.01 }}>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-3 rounded-xl border ${formErrors.email ? "border-red-500" : "border-gray-300"
                                                            } focus:border-purple-600 focus:outline-none transition-colors`}
                                                        placeholder="juan@ejemplo.com"
                                                    />
                                                </motion.div>
                                                {formErrors.email && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-red-500 text-sm mt-1"
                                                    >
                                                        {formErrors.email}
                                                    </motion.p>
                                                )}
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Recibirás la confirmación en este email
                                                </p>
                                            </div>

                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                                    Teléfono (opcional)
                                                </label>
                                                <motion.div whileFocus={{ scale: 1.01 }}>
                                                    <input
                                                        type="tel"
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-3 rounded-xl border ${formErrors.phone ? "border-red-500" : "border-gray-300"
                                                            } focus:border-purple-600 focus:outline-none transition-colors`}
                                                        placeholder="999 999 999"
                                                    />
                                                </motion.div>
                                                {formErrors.phone && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-red-500 text-sm mt-1"
                                                    >
                                                        {formErrors.phone}
                                                    </motion.p>
                                                )}
                                            </div>

                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600"
                                                >
                                                    {error}
                                                </motion.div>
                                            )}

                                            <motion.button
                                                type="submit"
                                                disabled={submitting}
                                                whileHover={{ scale: submitting ? 1 : 1.02 }}
                                                whileTap={{ scale: submitting ? 1 : 0.98 }}
                                                className="w-full py-4 bg-purple-600 text-white font-semibold rounded-2xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                        Procesando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-5 w-5" />
                                                        Confirmar reserva
                                                    </>
                                                )}
                                            </motion.button>

                                            <p className="text-sm text-gray-500 text-center">
                                                Al confirmar, aceptas nuestros términos y condiciones
                                            </p>
                                        </form>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}