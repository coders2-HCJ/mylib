const mylib = {
    Node: class {
        constructor(element) {
            this.element = element;
        }
        text(text) {
            this.element.textContent = text;
            return this;
        }
        getText() {
            return this.element.textContent;
        }
        html(html) {
            this.element.innerHTML = html;
            return this;
        }
        getHTML() {
            return this.element.innerHTML;
        }
        css(css) {
            for (const property in css) {
                this.element.style[property] = css[property];
            }
            return this;
        }
        getCSS(property) {
            if (property === "all") {
                return this.element.style;
            } else {
                return this.element.style[property];
            }
        }
        events(events) {
            for (const event in events) {
                this.element.addEventListener(event, events[event]);
            }
            return this;
        }
        append(node) {
            this.element.appendChild(node.element);
            return this;
        }
        remove(node) {
            this.element.removeChild(node.element);
            return this;
        }
        getType() {
            return this.element.nodeName;
        }
        attributes(attributes) {
            for (const attribute in attributes) {
                this.element.setAttribute(attribute, attributes[attribute]);
            }
            return this;
        }
        getAttribute(attribute) {
            return this.element.getAttribute(attribute);
        }
        getEls(selector) {
            return Array.from(this.element.querySelectorAll(selector)).map(element => new mylib.Node(element));
        }
        getEl(selector) {
            return new mylib.Node(this.element.querySelector(selector));
        }
        copy() {
            return new mylib.Node(this.element);
        }
    },
    getEls(selector) {
        return Array.from(document.querySelectorAll(selector)).map(element => new this.Node(element));
    },
    getEl(selector) {
        return new this.Node(document.querySelector(selector));
    },
    createEl(selector) {
        return new this.Node(document.createElement(selector));
    },
    enableProgrammingInCanvas(errorMessage) {
        document.querySelectorAll("canvas").forEach(function(canvas) {
            const context = canvas.getContext(canvas.dataset.context || "2d");
            if (context) {
                with (context) {
                    eval(canvas.textContent);
                }
            } else {
                errorMessage = errorMessage || "Please make sure the canvas's context is enabled in your browser's settings.";
                canvas.textContent = errorMessage;
                throw new Error(errorMessage);
            }
        });
    },
    radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    },
    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    },
    Vector: class {
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z || 0;
        }
        copy() {
            return new mylib.Vector(this.x, this.y, this.z);
        }
        add(vector) {
            this.x += vector.x;
            this.y += vector.y;
            this.z += vector.z;
            return this;
        }
        sub(vector) {
            this.x -= vector.x;
            this.y -= vector.y;
            this.z -= vector.z;
            return this;
        }
        mult(vector) {
            this.x *= vector.x;
            this.y *= vector.y;
            this.z *= vector.z;
            return this;
        }
        div(vector) {
            this.x /= vector.x;
            this.y /= vector.y;
            this.z /= vector.z;
            return this;
        }
        mag() {
            return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
        }
        setMag(mag) {
            return this.normalize().mult(mag);
        }
        dot(vector) {
            return this.x * vector.x + this.y + vector.y + this.z + vector.z;
        }
        cross(vector) {
           return new mylib.Vector(this.y * vector.z - this.z * vector.y, this.z * vector.x - this.x * vector.z, this.x - vector.y, this.y - vector.x);
        }
        dist(vector) {
            return vector.copy().sub(this).mag();
        }
        normalize() {
            const mag = this.mag();
            if (mag !== 0) {
                return this.div(mag);
            }
        }
        limit(max) {
            const mag = this.mag();
            if (mag > max) {
                const factor = max / mag;
                return this.mult(new mylib.Vector(factor, factor, factor));
            }
        }
        lerp(vector, amount) {
            return this.add(new mylib.Vector((vector.x - this.x) * amount, (vector.y - this.y) * amount, (vector.z - this.z) * amount));
        }
        equals(vector) {
            return this.x === vector.x && this.y === vector.y && this.z === vector.z;
        }
    },
    Matrix4fv: class {
        constructor() {
            for (let i = 0; i < 16; i++) {
                this[i] = arguments[i];
            }
        }
        static identity() {
            return new mylib.Matrix4fv(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
        }
        mult(matrix) {
            const result = mylib.Matrix4fv.identity();
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    let sum = 0;
                    for (let k = 0; k < 4; k++) {
                        sum += matrix[i * 4 + k] * this[k * 4 + j];
                    }
                    result[i * 4 + j] = sum;
                }
            }
            return this = result;
        }
        static perspective(fov, aspect, zNear, zFar) {
            const focalLength = Math.tan(Math.PI / 2 - fov / 2);
            const rangeInv = 1.0 / (zNear - zFar);
            return new mylib.Matrix4fv(
                focalLength / aspect, 0, 0, 0,
                0, focalLength, 0, 0,
                0, 0, (zNear + zFar) * rangeInv, -1,
                0, 0, zNear * zFar * rangeInv * 2, 0
            );
        }
        static translation(x, y, z) {
            return new mylib.Matrix4fv(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                x, y, z, 1
            );
        }
        translate(matrix, x, y, z) {
            this.mult(matrix, this.translation(x, y, z));
        }
        static xRotation(degrees) {
            const c = Math.cos(degrees * Math.PI / 180);
            const s = Math.sin(degrees * Math.PI / 180);
            return new mylib.Matrix4fv(
                1, 0, 0, 0,
                0, c, s, 0,
                0, -s, c, 0,
                0, 0, 0, 1
            );
        }
        xRotate(degrees) {
            this.mult(mylib.Matrix4fv.xRotation(degrees));
        }
        static yRotation(degrees) {
            const c = Math.cos(degrees * Math.PI / 180);
            const s = Math.sin(degrees * Math.PI / 180);
            return new mylib.Matrix4fv(
                c, 0, -s, 0,
                0, 1, 0, 0,
                s, 0, c, 0,
                0, 0, 0, 1
            );
        }
        yRotate(degrees) {
            this.mult(mylib.Matrix4fv.yRotation(degrees));
        }
        static zRotation(degrees) {
            const c = Math.cos(degrees * Math.PI / 180);
            const s = Math.sin(degrees * Math.PI / 180);
            return new mylib.Matrix4fv(
                c, s, 0, 0,
                -s, c, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
        }
        zRotate(degrees) {
            this.mult(mylib.Matrix4fv.zRotation(degrees));
        }
        static scaling(x, y, z) {
            return new mylib.Matrix4fv(
                x, 0, 0, 0,
                0, y, 0, 0,
                0, 0, z, 0,
                0, 0, 0, 1
            );
        }
        scale(matrix, x, y, z) {
            this.mult(matrix, this.scaling(x, y, z));
        }
        inverse() {
            var m00 = this[0 * 4 + 0];
            var m01 = this[0 * 4 + 1];
            var m02 = this[0 * 4 + 2];
            var m03 = this[0 * 4 + 3];
            var m10 = this[1 * 4 + 0];
            var m11 = this[1 * 4 + 1];
            var m12 = this[1 * 4 + 2];
            var m13 = this[1 * 4 + 3];
            var m20 = this[2 * 4 + 0];
            var m21 = this[2 * 4 + 1];
            var m22 = this[2 * 4 + 2];
            var m23 = this[2 * 4 + 3];
            var m30 = this[3 * 4 + 0];
            var m31 = this[3 * 4 + 1];
            var m32 = this[3 * 4 + 2];
            var m33 = this[3 * 4 + 3];
            var tmp0 = m22 * m33;
            var tmp1 = m32 * m23;
            var tmp2 = m12 * m33;
            var tmp3 = m32 * m13;
            var tmp4 = m12 * m23;
            var tmp5 = m22 * m13;
            var tmp6 = m02 * m33;
            var tmp7 = m32 * m03;
            var tmp8 = m02 * m23;
            var tmp9 = m22 * m03;
            var tmp10 = m02 * m13;
            var tmp11 = m12 * m03;
            var tmp12 = m20 * m31;
            var tmp13 = m30 * m21;
            var tmp14 = m10 * m31;
            var tmp15 = m30 * m11;
            var tmp16 = m10 * m21;
            var tmp17 = m20 * m11;
            var tmp18 = m00 * m31;
            var tmp19 = m30 * m01;
            var tmp20 = m00 * m21;
            var tmp21 = m20 * m01;
            var tmp22 = m00 * m11;
            var tmp23 = m10 * m01;
            var t0 = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) - (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
            var t1 = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) - (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
            var t2 = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) - (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
            var t3 = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) - (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);
            var d = 1 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
            return this = new mylib.Matrix4fv(
                d * t0,
                d * t1,
                d * t2,
                d * t3,
                d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) - (tmp0 * m10 + tmp3 * m20 + tmp4 * m30)),
                d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) - (tmp1 * m00 + tmp6 * m20 + tmp9 * m30)),
                d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) - (tmp2 * m00 + tmp7 * m10 + tmp10 * m30)),
                d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) - (tmp5 * m00 + tmp8 * m10 + tmp11 * m20)),
                d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) - (tmp13 * m13 + tmp14 * m23 + tmp17 * m33)),
                d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) - (tmp12 * m03 + tmp19 * m23 + tmp20 * m33)),
                d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) - (tmp15 * m03 + tmp18 * m13 + tmp23 * m33)),
                d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) - (tmp16 * m03 + tmp21 * m13 + tmp22 * m23)),
                d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) - (tmp16 * m32 + tmp12 * m12 + tmp15 * m22)),
                d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) - (tmp18 * m22 + tmp21 * m32 + tmp13 * m02)),
                d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) - (tmp22 * m32 + tmp14 * m02 + tmp19 * m12)),
                d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) - (tmp20 * m12 + tmp23 * m22 + tmp17 * m02))
            );
        }
    }
};
