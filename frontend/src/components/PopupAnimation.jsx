import { forwardRef } from "react";
import { motion } from "motion/react";

/*
    Herbruikbare houer wat sy kinders met 'n "fade-in" animasie wys.
    Gebruik forwardRef sodat die buite klik vir die popup komponent toe maak steeds op die 
    DOM-element werk al sit die animasie logika in die komponent
*/
const AnimatedPopup = forwardRef(function AnimatedPopup(
    {
        //Keer dat die uitleg geaffekteer word deur om in die houer geplaas te word
        children,
        className = "",
        as = "div",
    },
    //DOM mode van kind, offclick funksie werk nogsteeds
    ref
) {
    // as == "div" -> motion.div
    const MotionComponent = motion[as];

    return (
        <MotionComponent
            ref={ref}
            className={className}
            //Begin deurskynend en effens kleiner, sodat daar 'n "in-fade" effek is
            initial={{
                opacity: 0,
                scale: 0.95,
                y: 15,
            }}
            //Eind produk is heeltemal sigbaar en op skaal
            animate={{
                opacity: 1,
                scale: 1,
                y: 0,
            }}
            //Duur en tipe animasie
            transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {/* children is verstek naam wat react gee om te verwys na alles binne houer in ouer komponent */}
            {children}
        </MotionComponent>
    );
});

//Uitvoer van die AnimatedPopup
export default AnimatedPopup;
