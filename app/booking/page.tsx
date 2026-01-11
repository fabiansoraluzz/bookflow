"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function BookingPage() {
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfessionals() {
            const { data } = await supabase
                .from('professionals')
                .select('*')
                .order('name');

            setProfessionals(data || []);
            setLoading(false);
        }
        loadProfessionals();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar con animación */}
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
                            <Calendar className="h-5 w-5" />
                        </motion.div>
                        <span>BookFlow</span>
                    </Link>
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-medium">Volver</span>
                    </Link>
                </div>
            </motion.nav>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl font-bold mb-4">Selecciona un profesional</h1>
                    <p className="text-xl text-gray-600">
                        Elige el profesional con quien deseas agendar tu cita
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
                        />
                    </div>
                ) : professionals.length > 0 ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {professionals.map((prof) => (
                            <motion.div
                                key={prof.id}
                                variants={item}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            >
                                <Link
                                    href={`/booking/${prof.id}`}
                                    className="block group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-purple-200 transition-all"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                            className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                                        >
                                            {prof.name.charAt(0)}
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold mb-1 group-hover:text-purple-600 transition-colors">
                                                {prof.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">{prof.specialty}</p>
                                        </div>
                                    </div>

                                    {prof.bio && (
                                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                            {prof.bio}
                                        </p>
                                    )}

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-sm font-medium text-purple-600 group-hover:underline">
                                            Ver disponibilidad
                                        </span>
                                        <motion.div
                                            initial={{ x: 0 }}
                                            whileHover={{ x: 5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            →
                                        </motion.div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-gray-200 rounded-2xl p-12 text-center"
                    >
                        <p className="text-gray-600 mb-4">
                            No hay profesionales disponibles en este momento
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-purple-600 font-medium hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver al inicio
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}