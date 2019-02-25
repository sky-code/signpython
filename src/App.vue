<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png">
        <sign/>
    </div>
</template>

<script>
    import sign from './components/sign.vue'

    export default {
        name: 'app',
        components: {
            sign
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
