<template>
    <div class="header-wrap" :class="{thisHome: catchHome}">
        <router-link to="/"><div class="flux">DOMI</div></router-link>
        <div class="nav-sec">
            <nav class="header-nav">
                <ul class="header-title">
                    <!--<router-link to="/laboratory">
                        <li :class="{activeLink: linkLaboratory}">Lab</li></router-link> -->
                    <router-link to="/list">
                        <li :class="{activeLink: linkPost}">Posting</li></router-link>
                </ul>
            </nav>
            <Burger @changePanelState="changePanelState"></Burger>
        </div>
    </div>
</template>
  
  <script lang="ts">
  import Burger from '@/components/Burger.vue';

  export default {
    components: {
        Burger
    },
    mixins: [
    ],
    props: {
      dummydata: Boolean 
    },
    data () {
      return {
        catchHome: false,

        linkLaboratory: false,
        linkPost: false,
      }
    },
    computed: {
    },
    presets: {
    },
    watch: {
        $route(to, form) {
            if (to.path !== form.path){
                const nowHref = window.location.href;
                this.linkLaboratory = false;
                this.linkPost = false;
                if(nowHref.includes('laboratory')) this.linkLaboratory = true;
                if(nowHref.includes('list') || nowHref.includes('posting')) this.linkPost = true;
            }
            to.name === 'home' ? this.catchHome = true : this.catchHome = false;
        },
    },
    mounted () {
        
    },
    methods: {
        changePanelState(state: any){
            this.$emit('changePanelState', state);
        }
    }
  }
  </script>

  <style scoped>
    @font-face {
        font-family: neon;
        src: url(../assets/fonts/neon.ttf);
    }
    .thisHome{
        box-shadow: none!important;
        z-index: 0!important;
    }
    .flux {
        font-family: neon;
        color: rgb(107, 176, 255);
        font-size: 40px;
        text-shadow: 0 0 1px rgb(60, 150, 253);
    }
    .flux {
        animation: flux 3s linear infinite;
        -moz-animation: flux 3s linear infinite;
        -webkit-animation: flux 3s linear infinite;
        -o-animation: flux 3s linear infinite;
    }
    @keyframes flux {
        0%,
        100% {
          text-shadow: 0 0 1vw #1041FF, 0 0 3vw #1041FF, 0 0 10vw #1041FF, 0 0 10vw #1041FF, 0 0 .4vw #8BFDFE, .5vw .5vw .1vw #147280;
          color: #28D7FE;
        }
        50% {
          text-shadow: 0 0 .5vw #082180, 0 0 1.5vw #082180, 0 0 5vw #082180, 0 0 5vw #082180, 0 0 .2vw #082180, .5vw .5vw .1vw #0A3940;
          color: #146C80;
        }
    }
    .activeLink{
        background-image: linear-gradient(92.88deg, #455EB5 9.16%, #5643CC 43.89%, #673FD7 64.72%);
        color: #fff;
        border: none!important;
        transition: background-color 0.3s ease-out 0s;
    }
    .header-wrap {
        width: 100%;
        z-index: 997;
        padding: 15px 30px 15px 30px;
        display: flex;
        align-items: center;
        box-shadow: 0 14px 28px rgba(255,255,255,0.01), 0 10px 10px rgba(255,255,255,0.02);
        background: rgb(32, 32, 36);
        justify-content: space-between;
    }
    .nav-sec{
        display: flex;
        align-items: center;
    }
    .header-nav{
        width: 100%;
    }
    .header-nav ul.sidebar-title li:first-child{
        margin-left: 0;
    }
    .header-nav ul{
        padding: 0;
        display: flex;
        flex-direction: row;
        margin: 0;
    }
    .header-nav ul.header-title li{
        margin: 0;
        font-weight: 500;
        cursor: pointer;
        font-size: 18px;
        margin-left: 20px;
        border: 1px solid #fff;
        padding: 8px 20px;
        border-radius: 20px;
        transition: background-color 0.3s ease-out 0s;
    }
    .header-nav ul.header-title li a {
        width: 100%;
        height: 100%;
        font-size: 16px;
    }
    .header-nav ul.header-title li:hover{
        background: #fff;
        color: rgb(32, 32, 36);
    }
    @media (max-width: 470px) {
        .header-wrap{
            padding: 8px 10px 8px 10px;
        }
        .flux{
            font-size: 30px;
        }
        .header-nav ul.header-title li{
            font-size: 16px;
            border: none;
            margin-left: 8px;
            padding: 4px 8px;
        }
        .header-nav ul.header-title li:hover{
            background: none;
            color: #fff;
        }
        .activeLink{
            background: none!important;
            border: none!important;
            color: rgb(64, 152, 252)!important;
            
        }
    }
    </style>
  