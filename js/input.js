// Movement from the keyboard (WASD / arrows) or a drag anywhere on the
// canvas (touch or mouse), which acts as a floating joystick.

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.stick = null;
    const keyMap = {
      ArrowUp: "u", KeyW: "u", ArrowDown: "d", KeyS: "d",
      ArrowLeft: "l", KeyA: "l", ArrowRight: "r", KeyD: "r",
    };
    window.addEventListener("keydown", (e) => {
      const k = keyMap[e.code];
      if (k) { this.keys.add(k); e.preventDefault(); }
    });
    window.addEventListener("keyup", (e) => {
      const k = keyMap[e.code];
      if (k) this.keys.delete(k);
    });
    window.addEventListener("blur", () => { this.keys.clear(); this.stick = null; });
    canvas.addEventListener("pointerdown", (e) => {
      canvas.setPointerCapture(e.pointerId);
      this.stick = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("pointermove", (e) => {
      if (this.stick && this.stick.id === e.pointerId) {
        this.stick.x = e.clientX;
        this.stick.y = e.clientY;
      }
    });
    const end = (e) => { if (this.stick && this.stick.id === e.pointerId) this.stick = null; };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
  }

  /** Current movement vector, length 0..1. */
  vector() {
    let x = (this.keys.has("r") ? 1 : 0) - (this.keys.has("l") ? 1 : 0);
    let y = (this.keys.has("d") ? 1 : 0) - (this.keys.has("u") ? 1 : 0);
    if (this.stick) {
      const dx = this.stick.x - this.stick.ox;
      const dy = this.stick.y - this.stick.oy;
      const len = Math.hypot(dx, dy);
      if (len > 8) {
        const strength = Math.min(1, len / 50);
        x = (dx / len) * strength;
        y = (dy / len) * strength;
      }
    }
    return { x, y };
  }

  reset() {
    this.keys.clear();
    this.stick = null;
  }
}
