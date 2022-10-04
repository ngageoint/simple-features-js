/**
 * Geometry Constants
 * 
 * @author osbornb
 * @since 1.1.1
 */
export class GeometryConstants {

	/**
	 * Default epsilon for point in or on line tolerance
	 */
	public static readonly DEFAULT_LINE_EPSILON = 0.000000000000001;

	/**
	 * Default epsilon for point equality
	 */
	public static readonly DEFAULT_EQUAL_EPSILON = 0.00000001;

	/**
	 * Web Mercator Latitude Range
	 */
	public static readonly WEB_MERCATOR_MAX_LAT_RANGE = 85.0511287798066;

	/**
	 * Web Mercator Latitude Range
	 */
	public static readonly WEB_MERCATOR_MIN_LAT_RANGE = -85.05112877980659;

	/**
	 * Half the world distance in either direction
	 */
	public static readonly WEB_MERCATOR_HALF_WORLD_WIDTH = 20037508.342789244;

	/**
	 * Half the world longitude width for WGS84
	 */
	public static readonly WGS84_HALF_WORLD_LON_WIDTH = 180.0;

	/**
	 * Half the world latitude height for WGS84
	 */
	public static readonly WGS84_HALF_WORLD_LAT_HEIGHT = 90.0;

	/**
	 * Minimum latitude degrees value convertible to meters
	 */
	public static readonly DEGREES_TO_METERS_MIN_LAT = -89.99999999999999;

	/**
	 * Absolute north bearing in degrees
	 */
	public static readonly BEARING_NORTH = 0.0;

	/**
	 * Absolute east bearing in degrees
	 */
	public static readonly BEARING_EAST = 90.0;

	/**
	 * Absolute south bearing in degrees
	 */
	public static readonly BEARING_SOUTH = 180.0;

	/**
	 * Absolute west bearing degrees
	 */
	public static readonly BEARING_WEST = 270.0;

	/**
	 * Radians to Degrees conversion
	 */
	public static readonly RADIANS_TO_DEGREES = 180.0 / Math.PI;

	/**
	 * Degrees to Radians conversion
	 */
	public static readonly DEGREES_TO_RADIANS = Math.PI / 180.0;

}
