// PrimitivesUtility.js - Defines utility functions that operate on basic coordinate/geometric
//                        primitives - provides conversion facilities, etc.
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Primitives.js
//  -Utility.js

var PrimitivesUtil = {};
	
/**
 *  Generates a vertex, using the coordinate specification
 *   contained within a 3D point object
 *  
 *  @param point3d {Point3d} 3D point representation object
 *  @return {Vertex3d} A vertex object generated using the
 *                     provided positional specification
 */
PrimitivesUtil.GenerateVertex3dFromPoint3d = function(point3d) {
	var newVertex = null;
	
	if (Utility.validateVarAgainstType(point3d, Point3d)) {
		newVertex = new Vertex3d(point3d.getX(), point3d.getY(), point3d.getZ());
	}
	
	return newVertex;
}

/**
 *  Generates a 3D point, using the component specification
 *   contained within a 3D vector object
 *  
 *  @param vector3d {Vector3d} 3D vector object
 *  @return {Point3d} A point object generated using the
 *                    provided component specification
 */
PrimitivesUtil.GeneratePoint3dFromVector3d = function(vector3d) {
	var newPoint = null;
	
	if (Utility.validateVarAgainstType(vector3d, Vector3d)) {
		newPoint = new Point3d(vector3d.getXComponent(), vector3d.getYComponent(), vector3d.getZComponent());
	}		
	
	return newPoint;
}
	
/**
 *  Generates a 3D vector, using the coordinate specification
 *   contained within a 3D point object
 *  
 *  @param point3d {Point3d} 3D point representation object
 *  @return {Vector3d} A 3D vector object generated using the
 *                     provided positional specification
 */
PrimitivesUtil.GenerateVector3dFromPoint3d = function(point3d) {
	var newVector = null;
	
	if (Utility.validateVarAgainstType(point3d, Point3d)) {
		newVector = new Vector3d(point3d.getX(), point3d.getY(), point3d.getZ());
	}		
	
	return newVector;
}
