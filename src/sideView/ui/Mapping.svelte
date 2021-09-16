<script>
  import Icon from 'svelte-awesome';
  import { trash, edit } from 'svelte-awesome/icons';

  export let type = '';
  export let key = '';
  export let value = '';
  export let id;
  export let first_line;
  export let first_column;
  export let last_line;
  export let last_column;
  let mapping;

  $: mapping = {
    type,
    key,
    value,
    id,
    location: {
      first_line,
      first_column,
      last_line,
      last_column,
    },
  };

  function deleteMapping() {
    vscode?.postMessage({
      message: 'deleteMapping',
      mapping,
    });
  }

  function flipPragma() {
    if (type !== 'pragma') return;
    vscode?.postMessage({
      message: 'flipPragma',
      mapping,
    });
  }

  function highlightMapping() {
    vscode?.postMessage({
      message: 'highlightMapping',
      mapping,
    });
  }

  function removeHighlight() {
    vscode?.postMessage({
      message: 'removeHighlight',
      mapping,
    });
  }
</script>

<div
  on:mouseover={highlightMapping}
  on:mouseout={removeHighlight}
  class="container">
  <div class="item-main">
    <span
      class="badge"
      class:define={type === 'definition'}
      class:pragmaOn={type === 'pragma' && key === 'on'}
      class:pragmaOff={type === 'pragma' && key === 'off'}
      on:click={flipPragma}>{key}</span>
    <i>Line: {first_line}</i>
  </div>
  <div class="item"><Icon data={edit} /></div>
  <div class="item" on:click={deleteMapping}><Icon data={trash} /></div>
</div>

<style>
  .badge {
    display: inline-block;
    padding: 0.25em 0.4em;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .container:hover {
    color: yellow;
  }

  .define {
    background-color: #2876cd;
    color: white;
  }

  .pragmaOn {
    background-color: green;
    color: white;
  }

  .pragmaOff {
    background-color: red;
    color: white;
  }

  .container {
    display: flex;
    text-align: left;
    margin-bottom: 5px;
    cursor: default;
  }

  .item {
    width: 25px;
    vertical-align: baseline;
    text-align: right;
  }

  .item:hover {
    color: var(--vscode-button-foreground);
  }

  .item-main {
    flex-grow: 1; /* Set the middle element to grow and stretch */
  }

  .item + .item {
    margin-left: 1%;
  }

  i {
    margin-left: 1em;
  }
</style>
