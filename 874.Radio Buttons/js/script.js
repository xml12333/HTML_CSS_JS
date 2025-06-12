class RadioButtonEffect {
  constructor(radioBtnGroups) {
    this.previousRadioBtn = null;

    radioBtnGroups.forEach((group) => {
      const radioBtn = gsap.utils.selector(group)("input[type='radio']")[0];

      radioBtn.addEventListener("change", () => {
        const nodes = this.getNodes(radioBtn);

        if (this.previousRadioBtn && this.previousRadioBtn !== radioBtn) {
          this.changeEffect(this.getNodes(this.previousRadioBtn), false);
        }

        this.changeEffect(nodes, true);
        this.previousRadioBtn = radioBtn;
      });
    });
  }

  getNodes(radioBtn) {
    const container = radioBtn.closest(".radio-btn-group");
    return [
      gsap.utils.shuffle(gsap.utils.selector(container)(".blue rect")),
      gsap.utils.shuffle(gsap.utils.selector(container)(".pink rect"))
    ];
  }

  changeEffect(nodes, isChecked) {
    gsap.to(nodes[0], {
      duration: 0.4,
      ease: "steps(8)",
      yPercent: isChecked ? "100" : "0",
      stagger: 0.015,
      overwrite: true
    });

    gsap.to(nodes[1], {
      duration: 0.4,
      ease: "steps(8)",
      yPercent: isChecked ? "100" : "0",
      stagger: 0.015,
      overwrite: true
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const radioBtnGroups = document.querySelectorAll(".radio-btn-group");
  new RadioButtonEffect(radioBtnGroups);
});