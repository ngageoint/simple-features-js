import { GeometryType, Geometry, Point, Curve, LineString, ShamosHoey } from "./internal";

/**
 * Compound Curve, Curve sub type
 * 
 * @author osbornb
 */
export class CompoundCurve extends Curve {


	/**
	 * List of line strings
	 */
	private _lineStrings: Array<LineString>

	public constructor();
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(lineStrings: Array<LineString>);
	public constructor(lineString: LineString);
	public constructor(compoundCurve: CompoundCurve);

	/**
	 * Constructor
	 */
	public constructor (...args) {
		if (args.length === 0) {
			super(GeometryType.COMPOUNDCURVE, false, false);
			this._lineStrings = [];
		} else if (args.length === 2) {
			super(GeometryType.COMPOUNDCURVE, args[0], args[1]);
			this._lineStrings = [];
		} else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.COMPOUNDCURVE, Geometry.hasZ(args[0]), Geometry.hasM(args[0]));
			this._lineStrings = args[0] || [];
		} else if (args.length === 1 && args[0] instanceof LineString) {
			super(GeometryType.COMPOUNDCURVE, args[0].hasZ, args[0].hasM);
			this._lineStrings = [];
			this.addLineString(args[0]);
		} else if (args.length === 1 && args[0] instanceof CompoundCurve) {
			super(GeometryType.COMPOUNDCURVE, args[0].hasZ, args[0].hasM);
			this._lineStrings = [];
			args[0].lineStrings.forEach(lineString => this.addLineString(lineString.copy() as LineString))
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
			this._lineStrings = [];
		}
	}

	/**
	 * Get the line strings
	 * @return line strings
	 */
	public get lineStrings (): Array<LineString> {
		return this._lineStrings;
	}

	/**
	 * Set the line strings
	 * @param lineStrings line strings
	 */
	public set lineStrings(lineStrings: Array<LineString>) {
		this._lineStrings = lineStrings;
	}

	/**
	 * Add a line string
	 * @param lineString line string
	 */
	public addLineString(lineString: LineString): void {
		this._lineStrings.push(lineString);
		this.updateZM(lineString);
	}

	/**
	 * Add line strings
	 * @param lineStrings line strings
	 */
	public addLineStrings(lineStrings: Array<LineString>): void {
		for (const lineString of lineStrings) {
			this.addLineString(lineString);
		}
	}

	/**
	 * Get the number of line strings
	 * @return number of line strings
	 */
	public numLineStrings(): number {
		return this._lineStrings.length;
	}

	/**
	 * Returns the Nth line string
	 * @param n  nth line string to return
	 * @return line string
	 */
	public getLineString(n: number): LineString {
		return this._lineStrings[n];
	}

	/**
	 * {@inheritDoc}
	 */
	public startPoint(): Point {
		let startPoint: Point = null;
		if (!this.isEmpty()) {
			for (const lineString of this._lineStrings) {
				if (!lineString.isEmpty()) {
					startPoint = lineString.startPoint();
					break;
				}
			}
		}
		return startPoint;
	}

	/**
	 * {@inheritDoc}
	 */
	public endPoint(): Point {
		let endPoint: Point = null;
		if (!this.isEmpty()) {
			for (let i = this._lineStrings.length - 1; i >= 0; i--) {
				const lineString: LineString = this._lineStrings[i];
				if (!lineString.isEmpty()) {
					endPoint = lineString.endPoint();
					break;
				}
			}
		}
		return endPoint;
	}

	/**
	 * {@inheritDoc}
	 */
	public isSimple(): boolean {
		return ShamosHoey.simplePolygonLineStrings(this._lineStrings);
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new CompoundCurve(this);
	}

	/**
	 * {@inheritDoc}
	 */
	public isEmpty(): boolean {
		return this._lineStrings.length === 0;
	}

	/**
	 * {@inheritDoc}
	 */
	public equals(obj: Geometry): boolean {
		let equal = true;
		if (obj instanceof CompoundCurve && this.numLineStrings() === obj.numLineStrings()) {
			for (let i = 0; i < this._lineStrings.length; i++) {
				if (!this.getLineString(i).equals(obj.getLineString(i))) {
					equal = false;
					break;
				}
			}
		} else {
			equal = false;
		}
		return equal;
	}
}
