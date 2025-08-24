//=============================================================================
// PaperDoll System - Gwenbloom (Version 1 - I Hate the Message Window Logic)
//=============================================================================

/*:
 * @plugindesc [Paperdoll VN System] Layered VN Character System.
 * @author Gwenbloom
 *
 * @param Type1
 * @type struct<PaperdollType>
 * @default {"id":1,"x":"0","y":"0","scaleX":"1","scaleY":"1"}
 *
 * @param Type2
 * @type struct<PaperdollType>
 * @default {"id":2,"x":"0","y":"0","scaleX":"1","scaleY":"1"}
 *
 * @param Type3
 * @type struct<PaperdollType>
 * @default {"id":3,"x":"0","y":"0","scaleX":"1","scaleY":"1"}
 *
 * @param Type4
 * @type struct<PaperdollType>
 * @default {"id":4,"x":"0","y":"0","scaleX":"1","scaleY":"1"}
 *
 * @param Type5
 * @type struct<PaperdollType>
 * @default {"id":5,"x":"0","y":"0","scaleX":"1","scaleY":"1"}
 *
 * @param Type6
 * @type struct<PaperdollType>
 * @default {"id":6,"x":"0","y":"0","scaleX":"1","scaleY":"1"}
 *
 * @param Type7
 * @type struct<PaperdollType>
 * @default {"id":7,"x":"0","y":"0","scaleX":"1","scaleY":"1"}
 *
 * @param Type8
 * @type struct<PaperdollType>
 * @default {"id":8,"x":"0","y":"0","scaleX":"1","scaleY":"1"}
 *
 * @param Type9
 * @type struct<PaperdollType>
 * @default {"id":9,"x":"0","y":"0","scaleX":"1","scaleY":"1"}
 *
 * @param Type10
 * @type struct<PaperdollType>
 * @default {"id":10,"x":"0","y":"0","scaleX":"1","scaleY":"1"}
 *
 * @param DefaultFadeDuration
 * @type number
 * @desc Duración por defecto para los efectos de opacidad si no se especifica.
 * @default 30
 *
 * @param DefaultOpacity
 * @type number
 * @desc Opacidad inicial de los bustos (0-255).
 * @default 255
 */

/*~struct~PaperdollType:
 * @param id
 * @type number
 * @desc ID de este tipo (1-10)
 *
 * @param x
 * @type number
 * @desc Posición X inicial
 *
 * @param y
 * @type number
 * @desc Posición Y inicial
 *
 * @param scaleX
 * @type number
 * @desc Escala en X
 *
 * @param scaleY
 * @type number
 * @desc Escala en Y
 */

(() => {
    const pluginName = "GBLOOM_PaperdollSys";
    const params = PluginManager.parameters(pluginName);

    const DefaultFadeDuration = Number(params['DefaultFadeDuration'] || 30);
    const DefaultOpacity = Number(params['DefaultOpacity'] || 255);

    const PaperdollTypes = {};
    for (let i = 1; i <= 10; i++) {
        const rawParam = params[`Type${i}`] || '{}';
        try {
            const raw = JSON.parse(rawParam);
            PaperdollTypes[i] = {
                defaultX: Number(raw.x) || 0,
                defaultY: Number(raw.y) || 0,
                scaleX: Number(raw.scaleX) || 1,
                scaleY: Number(raw.scaleY) || 1
            };
        } catch (e) {
            console.error(`Error al parsear el parámetro Type${i}:`, e);
            PaperdollTypes[i] = { defaultX: 0, defaultY: 0, scaleX: 1, scaleY: 1 };
        }
    }

    const Easing = {
        Linear: t => t,
        InSine: t => 1 - Math.cos((t * Math.PI) / 2),
        OutSine: t => Math.sin((t * Math.PI) / 2),
        InOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
        InQuad: t => t * t,
        OutQuad: t => t * (2 - t),
        InOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        InCubic: t => t * t * t,
        OutCubic: t => --t * t * t + 1,
        InOutCubic: t => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
        InQuart: t => t * t * t * t,
        OutQuart: t => 1 - --t * t * t * t,
        InOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
        InQuint: t => t * t * t * t * t,
        OutQuint: t => 1 + --t * t * t * t * t,
        InOutQuint: t => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t),
        InExpo: t => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
        OutExpo: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
        InOutExpo: t => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
        InCirc: t => -(Math.sqrt(1 - t * t) - 1),
        OutCirc: t => Math.sqrt(1 - --t * t),
        InOutCirc: t => (t < 0.5 ? (1 - Math.sqrt(1 - (2 * t) * (2 * t))) / 2 : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2),
        InBack: t => t * t * ((1.70158 + 1) * t - 1.70158),
        OutBack: t => --t * t * ((1.70158 + 1) * t + 1.70158) + 1,
        InOutBack: t => {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            return t < 0.5
                ? ((2 * t) * (2 * t) * (((c2) + 1) * 2 * t - (c2))) / 2
                : (((2 * t) - 2) * ((2 * t) - 2) * (((c2) + 1) * ((2 * t) - 2) + (c2)) + 2) / 2;
        },
        InElastic: t => (t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3))),
        OutElastic: t => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
        InOutElastic: t => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 + 1),
        InBounce: t => 1 - Easing.OutBounce(1 - t),
        OutBounce: t => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        },
        InOutBounce: t => t < 0.5
            ? (1 - Easing.OutBounce(1 - 2 * t)) / 2
            : (1 + Easing.OutBounce(2 * t - 1)) / 2,
    };

    const paperdolls = {};

    class PaperdollSprite extends Sprite {
        constructor(typeId, layers) {
            super();
            this.typeId = typeId;
            this.layers = [];
            this.offsetX = 0;
            this.offsetY = 0;
            this.opacity = DefaultOpacity;
            this._drawOverMessage = false;

            this._moveAnim = null;
            this._opacityAnim = null;
            this._scaleAnim = null;

            if (!PaperdollTypes[typeId]) {
                console.error(`Paperdoll Error: Type ID ${typeId} is not defined in plugin parameters.`);
                return;
            }

            this.setup(layers);
        }

        setup(layers) {
            const config = PaperdollTypes[this.typeId];
            this.x = config.defaultX;
            this.y = config.defaultY;
            this.scale.x = config.scaleX;
            this.scale.y = config.scaleY;

            const files = layers.split(",").map(f => f.trim());
            files.forEach(filename => {
                this.addLayer(filename);
            });
        }

        update() {
            super.update();
            this.updateMoveAnimation();
            this.updateOpacityAnimation();
            this.updateScaleAnimation();
            this.updateZIndex();
        }

        updateMoveAnimation() {
            if (!this._moveAnim) return;

            const t = this._moveAnim.currentFrame / this._moveAnim.duration;
            const easedProgress = this._moveAnim.easing(t);

            this.x = this._moveAnim.startX + (this._moveAnim.endX - this._moveAnim.startX) * easedProgress;
            this.y = this._moveAnim.startY + (this._moveAnim.endY - this._moveAnim.startY) * easedProgress;

            this._moveAnim.currentFrame++;

            if (this._moveAnim.currentFrame > this._moveAnim.duration) {
                this.x = this._moveAnim.endX;
                this.y = this._moveAnim.endY;
                this._moveAnim = null;
            }
        }

        updateOpacityAnimation() {
            if (!this._opacityAnim) return;

            const t = this._opacityAnim.currentFrame / this._opacityAnim.duration;
            const easedProgress = Easing.Linear(t);

            this.opacity = this._opacityAnim.startOpacity + (this._opacityAnim.endOpacity - this._opacityAnim.startOpacity) * easedProgress;

            this._opacityAnim.currentFrame++;

            if (this._opacityAnim.currentFrame > this._opacityAnim.duration) {
                this.opacity = this._opacityAnim.endOpacity;
                this._opacityAnim = null;
            }
        }

        updateScaleAnimation() {
            if (!this._scaleAnim) return;

            const t = this._scaleAnim.currentFrame / this._scaleAnim.duration;
            const easedProgress = Easing.Linear(t);

            if (this._scaleAnim.endScaleX !== null) {
                this.scale.x = this._scaleAnim.startScaleX + (this._scaleAnim.endScaleX - this._scaleAnim.startScaleX) * easedProgress;
            }
            if (this._scaleAnim.endScaleY !== null) {
                this.scale.y = this._scaleAnim.startScaleY + (this._scaleAnim.endScaleY - this._scaleAnim.startScaleY) * easedProgress;
            }

            this._scaleAnim.currentFrame++;

            if (this._scaleAnim.currentFrame > this._scaleAnim.duration) {
                if (this._scaleAnim.endScaleX !== null) this.scale.x = this._scaleAnim.endScaleX;
                if (this._scaleAnim.endScaleY !== null) this.scale.y = this._scaleAnim.endScaleY;
                this._scaleAnim = null;
            }
        }

        move(deltaX, deltaY, duration = 0, easingType = 'Linear') {
            const config = PaperdollTypes[this.typeId];
            const targetX = (config ? config.defaultX : 0) + (this.offsetX + deltaX);
            const targetY = (config ? config.defaultY : 0) + (this.offsetY + deltaY);

            if (duration > 0) {
                const easingFunction = Easing[easingType] || Easing.Linear;
                this._moveAnim = {
                    startX: this.x,
                    startY: this.y,
                    endX: targetX,
                    endY: targetY,
                    duration: duration,
                    currentFrame: 0,
                    easing: easingFunction
                };
            } else {
                this.x = targetX;
                this.y = targetY;
                this._moveAnim = null;
            }

            this.offsetX += deltaX;
            this.offsetY += deltaY;
        }

        changeOpacity(newOpacity, duration) {
            if (duration > 0) {
                this._opacityAnim = {
                    startOpacity: this.opacity,
                    endOpacity: newOpacity,
                    duration: duration,
                    currentFrame: 0
                };
            } else {
                this.opacity = newOpacity;
                this._opacityAnim = null;
            }
        }

        changeScale(targetScaleX, targetScaleY, duration) {
            if (duration > 0) {
                this._scaleAnim = {
                    startScaleX: this.scale.x,
                    startScaleY: this.scale.y,
                    endScaleX: targetScaleX,
                    endScaleY: targetScaleY,
                    duration: duration,
                    currentFrame: 0
                };
            } else {
                this.scale.x = targetScaleX;
                this.scale.y = targetScaleY;
                this._scaleAnim = null;
            }
        }

        addLayer(newFileName) {
            const name = newFileName.replace(/\.png$/i, '');
            const sprite = new Sprite(ImageManager.loadBitmap("img/paperdoll/", name));
            this.addChild(sprite);
            this.layers.push(sprite);
        }

        insertLayer(index, newFileName) {
            const name = newFileName.replace(/\.png$/i, '');
            const sprite = new Sprite(ImageManager.loadBitmap("img/paperdoll/", name));

            if (index >= 0 && index <= this.layers.length) {
                this.layers.splice(index, 0, sprite);
                this.addChild(sprite);
                this.reorderLayers();
            } else {
                console.warn(`InsertPaperdollLayer: Index ${index} is out of bounds. Adding to the end.`);
                this.addLayer(newFileName);
            }
        }

        reorderLayers() {
            this.layers.forEach((sprite, index) => {
                this.setChildIndex(sprite, index);
            });
        }

        updateLayer(layerIndex, newFileName) {
            const index = layerIndex - 1; // Convert to 0-based index
            if (index >= 0 && index < this.layers.length) {
                const sprite = this.layers[index];
                const name = newFileName.replace(/\.png$/i, '');
                if (sprite) {
                    sprite.bitmap = ImageManager.loadBitmap("img/paperdoll/", name);
                }
            } else {
                this.addLayer(newFileName);
            }
        }

        removeLayer(layerIndex) {
            const index = layerIndex - 1; // Convert to 0-based index
            if (index >= 0 && index < this.layers.length) {
                const spriteToRemove = this.layers[index];
                if (spriteToRemove) {
                    this.removeChild(spriteToRemove);
                    this.layers.splice(index, 1);
                }
            } else {
                console.warn(`RemovePaperdollLayer: Layer index ${layerIndex} is out of bounds.`);
            }
        }

        reparent() {
            const scene = SceneManager._scene;
            if (!scene) return;

            let newParent = scene.children.find(c => c instanceof Spriteset_Map) || scene;

            if (this._drawOverMessage) {
                newParent = scene._windowLayer;
            }

            if (this.parent !== newParent) {
                if (this.parent) {
                    this.parent.removeChild(this);
                }
                newParent.addChild(this);
            }
        }

        updateZIndex() {
            if (this.parent === SceneManager._scene._windowLayer) {
                const messageWindow = SceneManager._scene._messageWindow;
                if (messageWindow) {
                    const messageIndex = this.parent.children.indexOf(messageWindow);
                    if (messageIndex !== -1) {
                        const newIndex = this._drawOverMessage ? messageIndex + 1 : messageIndex;
                        this.parent.setChildIndex(this, newIndex);
                    }
                }
            }
        }
    }

    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        const typeId = Number(args[0]);
        let duration;

        switch (command) {
            case "ShowPaperdoll":
                const layers = args.slice(1).join(" ");
                if (paperdolls[typeId]) {
                    paperdolls[typeId].parent.removeChild(paperdolls[typeId]);
                }
                const sprite = new PaperdollSprite(typeId, layers);
                paperdolls[typeId] = sprite;
                sprite.reparent();
                break;
            case "ClearPaperdoll":
                if (paperdolls[typeId] && paperdolls[typeId].parent) {
                    paperdolls[typeId].parent.removeChild(paperdolls[typeId]);
                    delete paperdolls[typeId];
                }
                break;
            case "UpdatePaperdoll":
                if (paperdolls[typeId]) {
                    const layerIndex = Number(args[1]);
                    const newFile = args[2];
                    if (newFile !== undefined) {
                        paperdolls[typeId].updateLayer(layerIndex, newFile);
                    }
                }
                break;
            case "AddPaperdollLayer":
            case "PaperdollNewLayer":
                if (paperdolls[typeId]) {
                    if (args.length === 2) {
                        paperdolls[typeId].addLayer(args[1]);
                    } else if (args.length === 3) {
                        const layerIndex = Number(args[1]);
                        const newFile = args[2];
                        paperdolls[typeId].insertLayer(layerIndex - 1, newFile);
                    }
                }
                break;
            case "RemovePaperdollLayer":
                if (paperdolls[typeId]) {
                    const layerIndex = Number(args[1]);
                    paperdolls[typeId].removeLayer(layerIndex);
                }
                break;
            case "MovePaperdoll":
                if (paperdolls[typeId]) {
                    const dx = Number(args[1]);
                    const dy = Number(args[2]);
                    duration = Number(args[3]);
                    const easingType = args[4] || 'Linear';
                    paperdolls[typeId].move(dx, dy, duration, easingType);
                }
                break;
            case "PaperdollFadeIn":
                if (paperdolls[typeId]) {
                    duration = Number(args[1]) || DefaultFadeDuration;
                    paperdolls[typeId].changeOpacity(255, duration);
                } else {
                    console.warn(`PaperdollFadeIn: No paperdoll found for type ID ${typeId}. Please use ShowPaperdoll first.`);
                }
                break;
            case "PaperdollFadeOut":
                if (paperdolls[typeId]) {
                    duration = Number(args[1]) || DefaultFadeDuration;
                    paperdolls[typeId].changeOpacity(0, duration);
                }
                break;
            case "PaperdollOpacityBy":
                if (paperdolls[typeId]) {
                    const opacityChange = Number(args[1]);
                    duration = Number(args[2]) || DefaultFadeDuration;
                    const newOpacity = paperdolls[typeId].opacity + opacityChange;
                    paperdolls[typeId].changeOpacity(newOpacity, duration);
                }
                break;
            case "PaperdollOpacityTo":
                if (paperdolls[typeId]) {
                    const newOpacity = Number(args[1]);
                    duration = Number(args[2]) || DefaultFadeDuration;
                    paperdolls[typeId].changeOpacity(newOpacity, duration);
                }
                break;
            case "PaperdollSlideIn":
            case "PaperdollSlideInFromLeft":
            case "PaperdollSlideInFromRight":
                if (paperdolls[typeId]) {
                    const paperdoll = paperdolls[typeId];
                    const config = PaperdollTypes[paperdoll.typeId];

                    const duration = Number(args[1]) || DefaultFadeDuration;
                    const moveAmount = 20;
                    let dx = 0;
                    if (command === "PaperdollSlideInFromLeft") {
                        dx = -moveAmount;
                    } else if (command === "PaperdollSlideInFromRight") {
                        dx = moveAmount;
                    }

                    paperdoll.x = config.defaultX + dx;
                    paperdoll.y = config.defaultY;
                    paperdoll.opacity = 0;
                    paperdoll.offsetX = dx;
                    paperdoll.offsetY = 0;

                    paperdoll.move(-dx, 0, duration, "OutQuad");
                    paperdoll.changeOpacity(255, duration);
                } else {
                    console.warn(`PaperdollSlideIn: No paperdoll found for type ID ${typeId}. Please use ShowPaperdoll first.`);
                }
                break;
            case "PaperdollSlideOut":
            case "PaperdollSlideOutToLeft":
            case "PaperdollSlideOutToRight":
                if (paperdolls[typeId]) {
                    const paperdoll = paperdolls[typeId];
                    const duration = Number(args[1]) || DefaultFadeDuration;
                    const moveAmount = 20;
                    let dx = 0;
                    if (command === "PaperdollSlideOutToLeft") {
                        dx = -moveAmount;
                    } else if (command === "PaperdollSlideOutToRight") {
                        dx = moveAmount;
                    }

                    paperdoll.move(dx, 0, duration, "OutQuad");
                    paperdoll.changeOpacity(0, duration);
                } else {
                    console.warn(`PaperdollSlideOut: No paperdoll found for type ID ${typeId}. It may have been cleared already.`);
                }
                break;
            case "PaperdollScaleTo":
            case "PaperdollScaleToX":
            case "PaperdollScaleToY":
                if (paperdolls[typeId]) {
                    const paperdoll = paperdolls[typeId];
                    const targetScale = Number(args[1]);
                    const duration = Number(args[2]) || DefaultFadeDuration;
                    let targetX = paperdoll.scale.x;
                    let targetY = paperdoll.scale.y;

                    if (command === "PaperdollScaleTo") {
                        targetX = targetScale;
                        targetY = targetScale;
                    } else if (command === "PaperdollScaleToX") {
                        targetX = targetScale;
                    } else if (command === "PaperdollScaleToY") {
                        targetY = targetScale;
                    }
                    paperdoll.changeScale(targetX, targetY, duration);
                } else {
                    console.warn(`PaperdollScaleTo: No paperdoll found for type ID ${typeId}.`);
                }
                break;
            case "PaperdollScaleBy":
            case "PaperdollScaleByX":
            case "PaperdollScaleByY":
                if (paperdolls[typeId]) {
                    const paperdoll = paperdolls[typeId];
                    const scaleChange = Number(args[1]);
                    const duration = Number(args[2]) || DefaultFadeDuration;
                    let targetX = paperdoll.scale.x;
                    let targetY = paperdoll.scale.y;

                    if (command === "PaperdollScaleBy") {
                        targetX += scaleChange;
                        targetY += scaleChange;
                    } else if (command === "PaperdollScaleByX") {
                        targetX += scaleChange;
                    } else if (command === "PaperdollScaleByY") {
                        targetY += scaleChange;
                    }
                    paperdoll.changeScale(targetX, targetY, duration);
                } else {
                    console.warn(`PaperdollScaleBy: No paperdoll found for type ID ${typeId}.`);
                }
                break;
            case "PaperdollOverTheWindow":
                const overWindow = (args[0] === 'true');
                for (const id in paperdolls) {
                    if (paperdolls.hasOwnProperty(id)) {
                        paperdolls[id]._drawOverMessage = overWindow;
                        paperdolls[id].reparent();
                    }
                }
                break;
        }
    };
})();
