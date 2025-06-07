// ParticlesBackground.js
import React from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

function ParticlesBackground() {
  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false }, // handled by the App's background
        background: { color: { value: "transparent" } },
        particles: {
          number: {
            value: 100,
            density: { enable: true, area: 800 }
          },
          color: {
            value: ["#ff66cc", "#aa00ff", "#00ccff", "#66ffff", "#ffffff"]
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 0.8,
            random: true,
            anim: {
              enable: true,
              speed: 0.5,
              opacity_min: 0.3,
              sync: false
            }
          },
          size: {
            value: { min: 3, max: 6 },
            random: true
          },
          links: {
            enable: true,
            distance: 130,
            color: "#ffffff",
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 0.6,
            direction: "none",
            outModes: { default: "bounce" }
          }
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" }
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { quantity: 2 }
          }
        },
        detectRetina: true,
        emitters: [
          {
            direction: "top-right",
            rate: {
              delay: 5,
              quantity: 1
            },
            size: {
              width: 0,
              height: 0
            },
            position: {
              x: 0,
              y: 100
            },
            particles: {
              move: {
                direction: "top-right",
                speed: { min: 3, max: 5 },
                straight: true,
                outModes: { default: "destroy" }
              },
              size: { value: 2 },
              color: { value: "#ffffff" },
              shape: { type: "line" },
              opacity: {
                value: 1
              }
            }
          }
        ]
      }}
    />
  );
}

export default ParticlesBackground;
