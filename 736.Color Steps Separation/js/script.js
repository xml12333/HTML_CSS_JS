let vm = new Vue({
  el: 'main',
  mixins: [vueMixinColorFunctions],
  data: {
    min: 3,
    max: 27,
    delta: 10,
    steps: 11,
    color1: '#0ebeff',
    color2: '#ff42b3',
  },
  computed: {
    colors () {
      return this.interpolateColors(this.color1, this.color2, this.steps)
    },
    visualSteps () {
      return (this.steps - 2)
    },
    visualStepsLabel () {
      return (this.visualSteps === 1 ? 'step' : 'steps')
    },
  },
  methods: {
    adjust (color) {
      const hex = this.rgbToHex(color[0], color[1], color[2])
      return this.foregroundAdjust(hex)
    },
    setStyles(color) {
      return `background: rgb(${color}); color: ${this.adjust(color)}`
    },
    colorName (color) {
      return this.rgbArrayToHex(color)
    },
  }
})