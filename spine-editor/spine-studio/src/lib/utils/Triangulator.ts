export class Triangulator {
    // Simple Ear Clipping Algorithm
    // Expects vertices as flattened array [x, y, x, y, ...]
    static triangulate(vertices: ArrayLike<number>): number[] {
        const indices: number[] = [];
        if (vertices.length < 6) return indices; // Need at least 3 points (6 coords)

        const pointCount = vertices.length / 2;
        // Linked list of vertex indices
        const V: number[] = [];
        for (let i = 0; i < pointCount; i++) V.push(i);

        let n = pointCount;
        let count = 2 * n; // Safety counter

        let v = n - 1;
        while (n > 2) {
            if (count-- <= 0) {
                // Failed to triangulate - probably self-intersecting or complex
                console.warn("Triangulation failed or timed out");
                return indices;
            }

            const u = v;
            if (n <= u) v = 0;
            v = u + 1;
            if (n <= v) v = 0;
            const w = v + 1;
            if (n <= w) w = 0;

            if (Triangulator.snip(vertices, u, v, w, n, V)) {
                indices.push(V[u], V[v], V[w]);
                // Remove v from array
                V.splice(v, 1);
                n--;
                count = 2 * n;
            }
        }

        return indices;
    }

    private static snip(vertices: ArrayLike<number>, u: number, v: number, w: number, n: number, V: number[]): boolean {
        const Ax = vertices[V[u] * 2];
        const Ay = vertices[V[u] * 2 + 1];
        const Bx = vertices[V[v] * 2];
        const By = vertices[V[v] * 2 + 1];
        const Cx = vertices[V[w] * 2];
        const Cy = vertices[V[w] * 2 + 1];

        // EPSILON
        if (0.0000000001 > (((Bx - Ax) * (Cy - Ay)) - ((By - Ay) * (Cx - Ax)))) return false;

        for (let p = 0; p < n; p++) {
            if ((p === u) || (p === v) || (p === w)) continue;
            const Px = vertices[V[p] * 2];
            const Py = vertices[V[p] * 2 + 1];
            if (Triangulator.insideTriangle(Ax, Ay, Bx, By, Cx, Cy, Px, Py)) return false;
        }

        return true;
    }

    private static insideTriangle(Ax: number, Ay: number, Bx: number, By: number, Cx: number, Cy: number, Px: number, Py: number): boolean {
        const ax = Cx - Bx; const ay = Cy - By;
        const bx = Ax - Cx; const by = Ay - Cy;
        const cx = Bx - Ax; const cy = By - Ay;
        const apx = Px - Ax; const apy = Py - Ay;
        const bpx = Px - Bx; const bpy = Py - By;
        const cpx = Px - Cx; const cpy = Py - Cy;

        const aCROSSbp = ax * bpy - ay * bpx;
        const cCROSSap = cx * apy - cy * apx;
        const bCROSScp = bx * cpy - by * cpx;

        return ((aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0));
    }
}
