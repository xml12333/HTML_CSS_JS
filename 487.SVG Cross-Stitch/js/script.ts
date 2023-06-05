type CrossStitchGroup = { id?: number; color: string; items: Point[] };
type CrossStitchData = {
	width: number;
	height: number;
	data: CrossStitchGroup[];
};

interface IRgb {
	r: number;
	g: number;
	b: number;
}

class Rgb implements IRgb {
	constructor(color: IRgb | string | number[]) {
		const c = Array.isArray(color)
			? this.fromArray(color)
			: typeof color === "string"
			? this.parce(color as string)
			: (color as IRgb);

		this.r = c.r;
		this.g = c.g;
		this.b = c.b;
	}
	r: number = 0;
	g: number = 0;
	b: number = 0;

	parce(color: string): IRgb {
		const matchColors = /(\d{1,3})[,\s]+(\d{1,3})[,\s]+(\d{1,3})/;

		const match: RegExpExecArray | null = matchColors.exec(color);

		if (match !== null) {
			return this.fromArray(match.copyWithin(0, 1));
		}
		return { r: 0, g: 0, b: 0 };
	}

	fromArray(array: any[]): IRgb {
		if (array.length >= 3) {
			return { r: array[0], g: array[1], b: array[2] };
		}
		return { r: 0, g: 0, b: 0 };
	}

	public get value(): IRgb {
		return {
			r: this.r,
			g: this.g,
			b: this.b
		};
	}

	toString = () => `rgb(${this.r}, ${this.g}, ${this.b})`;
}

class ColorConverter {
	static bpp8to24bpp(color: IRgb): IRgb {
		const encodedData =
			(Math.floor(color.r / 32) << 5) +
			(Math.floor(color.g / 32) << 2) +
			Math.floor(color.b / 64);
		const r = (encodedData >> 5) * 32;
		const g = ((encodedData & 28) >> 2) * 32;
		const b = (encodedData & 3) * 64;
		return { r, g, b };
	}
}

class FileDialog {
	private _accept!: string;
	private _multiple!: boolean;
	private _fileInput!: HTMLInputElement;

	public get accept(): string {
		return this._accept;
	}

	public set accept(v: string) {
		this._accept = v;
		this._fileInput.accept = v;
	}

	public get multiple(): boolean {
		return this._multiple;
	}

	public set multiple(v: boolean) {
		this._multiple = v;
		this._fileInput.multiple = v;
	}

	constructor(filter: string = `image/*`, multiple: boolean = true) {
		this._fileInput = document.createElement("input");
		this._fileInput.type = "file";
		this.accept = filter;
		this.multiple = multiple;
		this.initChange();
	}

	private initChange() {
		this._fileInput.onchange = (e) => {
			const target = e.target as HTMLInputElement;
			const files = target.files;

			if (!files) return;

			const fileOk = new CustomEvent("fileOk", {
				detail: { files }
			});
			window.dispatchEvent(fileOk);
		};
	}

	showDialog = (): void => this._fileInput.click();

	dispose = (): void => {
		this._fileInput.value = "";
	};
}

class CanvasRender {
	private _w: number = 0;
	private _h: number = 0;

	canvas!: HTMLCanvasElement;

	context!: CanvasRenderingContext2D;

	public set width(v: number) {
		this._w = v;
		this.canvas.width = this.width;
	}

	public get width(): number {
		return this._w;
	}

	public set height(v: number) {
		this._h = v;
		this.canvas.height = this.height;
	}

	public get height(): number {
		return this._h;
	}

	public get imageData(): ImageData {
		return this.context.getImageData(0, 0, this.width, this.height);
	}

	render(image: HTMLImageElement, smoothing: boolean = false) {
		this.context.imageSmoothingEnabled = smoothing;
		this.context.drawImage(
			image,
			0,
			0,
			image.naturalWidth,
			image.naturalHeight,
			0,
			0,
			this.width,
			this.height
		);
	}

	static calculateAspectRatioFit(
		srcWidth: number,
		srcHeight: number,
		maxWidth: number = 128,
		maxHeight: number = 128
	) {
		if (srcWidth <= 0 || srcHeight <= 0) return { width: 0, height: 0 };

		const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

		return {
			width: Math.ceil(srcWidth * ratio),
			height: Math.ceil(srcHeight * ratio)
		};
	}

	constructor(width: number = 800, height: number = 600) {
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.width = width;
		this.height = height;
	}
}

class CrossStitch {
	constructor() {}

	public static toCrossStitchData(
		imageData: ImageData,
		is8bit: boolean = true
	): Promise<CrossStitchData> {
		const groups: CrossStitchGroup[] = [];
		const data: Uint8ClampedArray = imageData.data;
		const w: number = imageData.width;
		const h: number = imageData.width;

		return new Promise<CrossStitchData>((resolve, reject) => {
			const L = imageData.data.length;

			for (let i = 0; i < L; i += 4) {
				const a = data[i + 3];
				if (a === 0) continue;

				const x = (i / 4) % w;
				const y = Math.floor(i / 4 / w);

				const c = new Rgb([data[i], data[i + 1], data[i + 2]]);

				const color = is8bit ? new Rgb(ColorConverter.bpp8to24bpp(c)) : c;
				let g;

				const temtG = groups.find((i) => i.color === color.toString());

				if (temtG) {
					g = temtG;
				} else {
					g = {
						id: 1,
						color: color.toString(),
						items: []
					};
					groups.push(g);
				}

				g.items.push({ x, y });
			}

			groups.sort((a, b) => b.items.length - a.items.length);

			resolve({ width: w, height: h, data: groups });
		});
	}
}
//
// main()
//
const dialog: FileDialog = new FileDialog("image/*", false);
const image = document.querySelector("#image");
const svg = document.querySelector("#svg");
const details = document.querySelector("#details");
const is8bit = document.querySelector("#is8bit");

const svgResult = document.querySelector("#svgResult");
let maxSize = 64;

window.addEventListener("fileOk", (e) => {
	const files = e.detail.files;
	if (!files) return;

	const file: File = files[0];
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = (e) => {
		this.image.src = reader.result as string;
	};
});

image.addEventListener("load", (e) => {
	render();
});

render();

function render() {
	maxSize = details.value;
	maxSize = Math.min(image.naturalWidth, maxSize);
	const scaledSize = CanvasRender.calculateAspectRatioFit(
		image.naturalWidth,
		image.naturalHeight,
		maxSize,
		maxSize
	);
console.log(scaledSize)
	const canvasRender = new CanvasRender(scaledSize.width, scaledSize.height);
	canvasRender.render(image);

	CrossStitch.toCrossStitchData(canvasRender.imageData, is8bit.checked).then((data) => {
		console.log(data.width, data.height)
		svg.setAttribute('viewBox', `0 0 ${scaledSize.width} ${scaledSize.height}`)
		svgResult.innerHTML = getGroupMarkupString(data.data)
	});
}

function getGroupMarkupString(groups) {
    let res = ``;
    groups.forEach(g => {
      res += `<g color="${g.color}">`;
      g.items.forEach(i => {
        res += `<use href="#x" x="${i.x}" y="${i.y}"></use>`;
      })
      res += `</g>`;
    })
    return res;
  }