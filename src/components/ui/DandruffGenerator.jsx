import { motion } from "framer-motion";
import { useMemo } from "react";

class DandruffParticles {
  static instance = null;
  static particles = {};

  static getInstance(count) {
    if (!this.particles[count]) {
      this.particles[count] = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 5 + 5,
        size: Math.random() * 2 + 1,
      }));
    }
    return this.particles[count];
  }
}

/**
 * Renderiza un contenedor con partículas animadas que simulan la caída de copos de caspa.
 *
 * Utiliza una instancia singleton de DandruffParticles para generar y memorizar un conjunto de partículas
 * basadas en la cantidad indicada. Cada partícula se representa mediante un elemento <code>motion.div</code>
 * que se anima verticalmente desde -10vh hasta 110vh, con propiedades de tamaño, posición y duración asignadas aleatoriamente.
 *
 * @param {object} props - Props del componente.
 * @param {number} [props.dandruffAmount=50] - Cantidad de partículas (copos de caspa) a renderizar.
 * @returns {JSX.Element} Elemento React que contiene las partículas animadas.
 */
function Dandruffer({ dandruffAmount = 50 }) {
  const stars = useMemo(
    () => DandruffParticles.getInstance(dandruffAmount),
    [dandruffAmount]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full opacity-75"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.x}%`,
            top: `-${star.size}px`,
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, 1, 0.5, 1, 0],
          }}
          transition={{
            duration: star.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

export default Dandruffer;
