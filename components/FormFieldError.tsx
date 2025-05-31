import { motion } from 'framer-motion';


const FormFieldError = ({message}: {message: string | undefined}) => {

    if (!message) return null;

    return (
        <motion.p
            className="text-red-400 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {message}
        </motion.p>
    )
}


export default FormFieldError;

// const fadeInUp = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -20 },
//     transition: { duration: 0.5 }
//   };
// const FormStepWrapper = ({
//     children,
//     stepKey,
//     maxWidth = "max-w-lg"
//   }: {
//     children: ReactNode;
//     stepKey: string;
//     maxWidth?: string;
//   }) => {
//     return (
//       <motion.div
//         key={stepKey}
//         className={`${maxWidth} w-full mx-auto`}
//         variants={fadeInUp}
//         initial="initial"
//         animate="animate"
//         exit="exit"
//       >
//         {children}
//       </motion.div>
//     );
//   }