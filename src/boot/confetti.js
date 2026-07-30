// quasar new boot pluralize
import { boot } from 'quasar/wrappers';

// npm module
import { Confetti } from 'vue-confetti';

// quasar new boot
export default boot(({ app }) => {
  app.config.globalProperties.$showConfetti = () => {
    // Confetti constructor
    const confettiInstance = new Confetti();

    confettiInstance.start({
      particles: [
        {
          type: 'heart',
          colors: [
            'green',
            'blue',
          ],
        },
      ],
    });

    // Store timeout ID
    const timer = setTimeout(() => {
      confettiInstance.stop();

      // Clear timeout
      clearTimeout(timer); // Optional, ensures timer cleanup
    }, 2500);
  };
});
