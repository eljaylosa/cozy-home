import Phaser from "phaser";

export default class HouseScene extends Phaser.Scene {
  constructor() {
    super("HouseScene");
  }

  init(data) {
    this.house = data?.house || {};
  }

  create() {
    const width = 960;
    const height = 640;
    const tile = 32;

    this.cameras.main.setBackgroundColor("#30251f");

    const room = this.add.graphics();

    // Wooden floor tiles
    for (let y = 64; y < 576; y += tile) {
      for (let x = 64; x < 896; x += tile) {
        const alternate = (x / tile + y / tile) % 2 === 0;
        room.fillStyle(alternate ? 0xb98255 : 0xa87349, 1);
        room.fillRect(x, y, tile, tile);

        room.lineStyle(1, 0x805638, 0.22);
        room.strokeRect(x, y, tile, tile);
      }
    }

    // Outer walls
    room.fillStyle(0x563b2b, 1);
    room.fillRect(32, 32, 896, 32);
    room.fillRect(32, 64, 32, 512);
    room.fillRect(896, 64, 32, 512);
    room.fillRect(32, 576, 896, 32);

    // Inner wall details
    room.fillStyle(0x9b6b48, 1);
    room.fillRect(64, 64, 832, 12);
    room.fillRect(64, 64, 12, 512);
    room.fillRect(884, 64, 12, 512);

    // Windows
    this.drawWindow(room, 220, 34);
    this.drawWindow(room, 700, 34);

    // Rug
    room.fillStyle(0x744b45, 1);
    room.fillRect(352, 320, 256, 160);
    room.fillStyle(0xc98d70, 1);
    room.fillRect(368, 336, 224, 128);
    room.lineStyle(3, 0x744b45, 1);
    room.strokeRect(368, 336, 224, 128);

    // Bed
    room.fillStyle(0x62432f, 1);
    room.fillRect(112, 112, 160, 112);
    room.fillStyle(0xe8d8bd, 1);
    room.fillRect(120, 120, 144, 96);
    room.fillStyle(0x9b7771, 1);
    room.fillRect(120, 120, 144, 34);
    room.fillStyle(0xf4ead7, 1);
    room.fillRect(132, 160, 52, 42);
    room.fillRect(192, 160, 52, 42);

    // Table
    room.fillStyle(0x65432c, 1);
    room.fillRect(672, 176, 128, 80);
    room.fillStyle(0xb98255, 1);
    room.fillRect(680, 168, 112, 72);

    // Table decoration
    room.fillStyle(0x66865a, 1);
    room.fillRect(728, 184, 16, 16);
    room.fillStyle(0xe9c879, 1);
    room.fillRect(720, 200, 32, 8);

    // Chairs
    this.drawFurniture(room, 640, 184, 24, 32, 0x805438);
    this.drawFurniture(room, 808, 184, 24, 32, 0x805438);

    // Plant
    room.fillStyle(0x805438, 1);
    room.fillRect(808, 400, 40, 32);
    room.fillStyle(0x527b4b, 1);
    room.fillRect(816, 368, 24, 32);
    room.fillRect(800, 376, 16, 16);
    room.fillRect(840, 376, 16, 16);

    // Shelf
    room.fillStyle(0x65432c, 1);
    room.fillRect(112, 280, 112, 32);
    room.fillStyle(0xc18a59, 1);
    room.fillRect(120, 272, 96, 12);
    room.fillStyle(0xd8b36c, 1);
    room.fillRect(136, 280, 12, 12);
    room.fillRect(168, 280, 12, 12);
    room.fillRect(192, 280, 12, 12);

    // Doorway at the bottom
    room.fillStyle(0x30251f, 1);
    room.fillRect(432, 576, 96, 32);
    room.fillStyle(0x9b6b48, 1);
    room.fillRect(440, 560, 80, 32);
    room.fillStyle(0xe3bd71, 1);
    room.fillRect(504, 576, 6, 6);

    // Create a temporary pixel character texture
    const character = this.make.graphics({ x: 0, y: 0, add: false });

    character.fillStyle(0x3c2d29, 1);
    character.fillRect(8, 0, 16, 8);
    character.fillStyle(0xf0bd91, 1);
    character.fillRect(8, 8, 16, 12);
    character.fillStyle(0x425c78, 1);
    character.fillRect(6, 20, 20, 12);
    character.fillStyle(0x4b352c, 1);
    character.fillRect(7, 32, 7, 6);
    character.fillRect(18, 32, 7, 6);
    character.generateTexture("temporary-player", 32, 40);
    character.destroy();

    this.player = this.physics
      ? null
      : this.add.image(480, 500, "temporary-player");

    this.player.setDepth(10);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");

    this.add
      .text(480, 20, this.house.name || "My Cozy Home", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#fff1dc",
        fontStyle: "bold",
        backgroundColor: "#563b2bcc",
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(480, 548, "EXIT", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#fff1dc",
        backgroundColor: "#563b2b",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5);
  }

  drawWindow(graphics, x, y) {
    graphics.fillStyle(0x563b2b, 1);
    graphics.fillRect(x, y, 72, 30);
    graphics.fillStyle(0x9bc5c5, 1);
    graphics.fillRect(x + 5, y + 5, 62, 20);
    graphics.fillStyle(0xf1d69b, 1);
    graphics.fillRect(x + 34, y + 5, 4, 20);
    graphics.fillRect(x + 5, y + 13, 62, 4);
  }

  drawFurniture(graphics, x, y, width, height, color) {
    graphics.fillStyle(color, 1);
    graphics.fillRect(x, y, width, height);
    graphics.fillStyle(0xb98255, 1);
    graphics.fillRect(x + 4, y + 4, width - 8, height - 8);
  }

  update(_, delta) {
    if (!this.player) return;

    const speed = 190;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.keys.A.isDown) velocityX -= 1;
    if (this.cursors.right.isDown || this.keys.D.isDown) velocityX += 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) velocityY -= 1;
    if (this.cursors.down.isDown || this.keys.S.isDown) velocityY += 1;

    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= Math.SQRT1_2;
      velocityY *= Math.SQRT1_2;
    }

    const movement = speed * (delta / 1000);

    this.player.x += velocityX * movement;
    this.player.y += velocityY * movement;

    // Keep the player inside the room for this first milestone
    this.player.x = Phaser.Math.Clamp(this.player.x, 88, 872);
    this.player.y = Phaser.Math.Clamp(this.player.y, 112, 548);
  }
}
