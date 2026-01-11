"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Sparkles, Users, Clock3, CheckCircle, Star, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [servicesCount, setServicesCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      const { data: profData } = await supabase.from('professionals').select('*').limit(3);
      const { count } = await supabase.from('services').select('*', { count: 'exact', head: true });

      setProfessionals(profData || []);
      setServicesCount(count || 0);
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Sistema de reservas inteligente</span>
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                  Agenda tu cita <span className="gradient-text">sin complicaciones</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xl text-gray-600 leading-relaxed">
                  Conecta con profesionales verificados, elige tu horario ideal y confirma tu cita en menos de 2 minutos.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row gap-4">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/booking" className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-purple-600 rounded-2xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl">
                      Reservar ahora
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <a href="#como-funciona" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold border-2 border-gray-300 rounded-2xl hover:bg-gray-50 transition-all">
                      Cómo funciona
                    </a>
                  </motion.div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex gap-8 pt-4">
                  {[
                    { value: professionals.length, label: "Profesionales", icon: Users },
                    { value: servicesCount, label: "Servicios", icon: Star },
                    { value: "24/7", label: "Disponible", icon: Zap },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <stat.icon className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="text-3xl font-bold text-purple-600">{typeof stat.value === 'number' ? `${stat.value}+` : stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative hidden lg:block">
                <div className="relative aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl" />
                  <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Disponible</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded-full" />
                    </div>
                    <div className="grid grid-cols-7 gap-2 pt-4">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <motion.div key={i} whileHover={{ scale: 1.1 }} className={`aspect-square rounded-lg transition-colors cursor-pointer ${i === 15 ? "bg-purple-600" : i > 15 && i < 20 ? "bg-purple-200" : "bg-gray-100"}`} />
                      ))}
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-600">15 slots disponibles</span>
                      <Link href="/booking">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">Reservar →</motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple, rápido y efectivo</h2>
              <p className="text-xl text-gray-600">Tres pasos para tu cita perfecta</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "Elige profesional", description: "Explora perfiles verificados con disponibilidad en tiempo real", color: "from-purple-500 to-purple-600" },
                { icon: Clock3, title: "Selecciona horario", description: "Ve slots disponibles y elige el mejor para ti", color: "from-pink-500 to-pink-600" },
                { icon: CheckCircle, title: "Confirma y listo", description: "Recibe confirmación por email al instante", color: "from-green-500 to-green-600" }
              ].map((feature, index) => (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }} className="bg-white border border-gray-200 rounded-3xl p-8 space-y-6 hover:shadow-xl transition-all">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color}`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {professionals.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-bold mb-2">Profesionales destacados</h2>
                  <p className="text-lg text-gray-600">Expertos verificados listos para atenderte</p>
                </div>
                <Link href="/booking" className="hidden sm:flex items-center gap-2 text-purple-600 font-medium hover:gap-3 transition-all">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {professionals.map((prof, index) => (
                  <motion.div key={prof.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -8 }}>
                    <Link href={`/booking/${prof.id}`} className="block group bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl hover:border-purple-200 transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div whileHover={{ scale: 1.1 }} className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-lg">
                          {prof.name.charAt(0)}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold truncate group-hover:text-purple-600 transition-colors">{prof.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{prof.specialty}</p>
                        </div>
                      </div>
                      {prof.bio && (<p className="text-sm text-gray-600 line-clamp-2 mb-4">{prof.bio}</p>)}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Ver disponibilidad</span>
                        <ArrowRight className="h-4 w-4 text-purple-600 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold">¿Eres profesional independiente?</h2>
            <p className="text-xl opacity-90">Automatiza tu agenda, reduce no-shows y enfócate en lo que mejor haces</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/professional/login" className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-white text-purple-600 rounded-2xl hover:shadow-xl transition-all">
                Comenzar gratis
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 font-bold text-lg">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span>BookFlow</span>
              </motion.div>
              <p className="text-sm text-gray-600">© {new Date().getFullYear()} BookFlow. Sistema de reservas profesional.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}