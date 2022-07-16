import { GeometryType, Geometry, MultiCurve, LineString, GeometryCollection } from "./internal";

/**
 * A restricted form of MultiCurve where each Curve in the collection must be of
 * type LineString.
 */
export class MultiLineString extends MultiCurve<LineString> {
	public constructor();
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(multiLineString: MultiLineString);
	public constructor(lineStrings: Array<LineString>);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor(...args) {
		if (args.length === 0) {
			super(GeometryType.MULTILINESTRING, false, false);
		} else if (args.length === 2) {
			super(GeometryType.MULTILINESTRING, args[0], args[1]);
		} else if (args.length === 1 && args[0] instanceof LineString) {
			super(GeometryType.MULTILINESTRING, args[0].hasZ, args[0].hasM);
			this.addLineString(args[0]);
		} else if (args.length === 1 && args[0] instanceof MultiLineString) {
			super(GeometryType.MULTILINESTRING, args[0].hasZ, args[0].hasM);
			args[0].lineStrings.forEach(lineString => this.addLineString(lineString));
		} else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.MULTILINESTRING, GeometryCollection.hasZ(args[0]), GeometryCollection.hasM(args[0]));
			this.lineStrings = args[0];
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
		}
	}

	/**
	 * Get the line strings
	 * @return line strings
	 */
	public get lineStrings(): Array<LineString>  {
		return this.getCurves();
	}

	/**
	 * Set the line strings
	 * 
	 * @param lineStrings
	 *            line strings
	 */
	public set lineStrings(lineStrings: Array<LineString>) {
		this.setCurves(lineStrings);
	}

	/**
	 * Add a line string
	 * 
	 * @param lineString
	 *            line string
	 */
	public addLineString(lineString: LineString): void {
		this.addCurve(lineString);
	}

	/**
	 * Add line strings
	 * 
	 * @param lineStrings
	 *            line strings
	 */
	public addLineStrings(lineStrings: Array<LineString>): void {
		this.addCurves(lineStrings);
	}

	/**
	 * Get the number of line strings
	 * 
	 * @return number of line strings
	 */
	public numLineStrings(): number {
		return this.numCurves();
	}

	/**
	 * Returns the Nth line string
	 * @param n nth line string to return
	 * @return line string
	 */
	public getLineString(n: number): LineString {
		return this.getCurve(n);
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new MultiLineString(this);
	}
}
