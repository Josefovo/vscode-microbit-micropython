<script>
  import { onMount } from 'svelte';
  import Button from './ui/Button.svelte';

  onMount(async () => {
    // Listen to events

    window.addEventListener('message', async (event) => {
      const message = event.data.message;
      const params = event.data.params;

      switch (message) {
        case 'test':
          console.log('I am ready');
          break;
        default:
          break;
      }
    });
  });

  function flashMicroPython() {
    vscode?.postMessage({ message: 'flashMicroPython' });
  }
</script>

<main>
  <p>Hello World</p>
  <Button on:click={flashMicroPython} name="Upload MicroPython" />
</main>
