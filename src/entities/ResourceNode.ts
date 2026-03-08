import Phaser from 'phaser';
import type { NodeType, ResourceNodeData } from '../core/types';

const styles: Record<NodeType, { color: number; size: [number, number] }> = {
  tree: { color: 0x226622, size: [26, 34] },
  boulder: { color: 0x666666, size: [24, 20] },
  berry_bush: { color: 0x2d8d2d, size: [20, 16] },
  grass_tuft: { color: 0x77bb55, size: [12, 14] },
  sapling: { color: 0x66aa44, size: [10, 18] }
};

export class ResourceNode extends Phaser.GameObjects.Rectangle {
  dataModel: ResourceNodeData;

  constructor(scene: Phaser.Scene, data: ResourceNodeData) {
    const style = styles[data.type];
    super(scene, data.x, data.y, style.size[0], style.size[1], style.color);
    this.dataModel = data;
    scene.add.existing(this);
  }
}
