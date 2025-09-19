import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

// PUBLIC_INTERFACE
export default component$(() => {
  return (
    <div class="page-container">
      <h1 class="main-title">music_player_frontend is being generated</h1>
    </div>
  );
});

export const head: DocumentHead = {
  title: "music_player_frontend",
  meta: [
    {
      name: "description",
      content: "Ultralight Qwik template",
    },
  ],
};
