(function() {
  define(['./polygon', './ops', './barnes_hut'], function(Polygon, O, bh) {
    var attractive_forces, cap, inside, map_objects, random_position;
    random_position = function(w, h) {
      return [Math.random() * w, Math.random() * h];
    };
    cap = function(bound, x) {
      return Math.min(Math.max(x, 0), bound);
    };
    inside = function(w, h) {
      return function(_arg) {
        var x, y;
        x = _arg[0], y = _arg[1];
        return [cap(w, x), cap(h, y)];
      };
    };
    map_objects = function(obj, f) {
      var k, result, v;
      result = [];
      for (k in obj) {
        v = obj[k];
        result.push(f(k, v));
      }
      return result;
    };
    attractive_forces = function(links, positions, attraction) {
      var end, force, forces, id, pos1, pos2, start, weight, _ref;
      forces = {};
      for (id in links) {
        _ref = links[id], start = _ref.start, end = _ref.end, weight = _ref.weight;
        pos1 = positions[start];
        pos2 = positions[end];
        force = O.times(attraction * weight, O.minus(pos1, pos2));
        if (forces[start] == null) {
          forces[start] = [0, 0];
        }
        if (forces[end] == null) {
          forces[end] = [0, 0];
        }
        forces[start] = O.minus(forces[start], force);
        forces[end] = O.plus(forces[end], force);
      }
      return forces;
    };
    return function(_arg) {
      var attraction, bound, data, end, graph, height, id, link, linkaccessor, links, links_, node, nodeaccessor, nodes, nodes_, nodes_positions, recompute, repulsion, start, threshold, tick, weight, width, _i, _j, _len, _len1, _ref;
      data = _arg.data, nodeaccessor = _arg.nodeaccessor, linkaccessor = _arg.linkaccessor, width = _arg.width, height = _arg.height, attraction = _arg.attraction, repulsion = _arg.repulsion, threshold = _arg.threshold;
      if (nodeaccessor == null) {
        nodeaccessor = function(n) {
          return n;
        };
      }
      if (linkaccessor == null) {
        linkaccessor = function(l) {
          return l;
        };
      }
      if (attraction == null) {
        attraction = 0.01;
      }
      if (repulsion == null) {
        repulsion = 1000;
      }
      if (threshold == null) {
        threshold = 0.5;
      }
      bound = inside(width, height);
      nodes = data.nodes, links = data.links;
      nodes_positions = {};
      nodes_ = {};
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        id = nodeaccessor(node);
        nodes_positions[id] = random_position(width, height);
        nodes_[id] = node;
      }
      links_ = {};
      for (_j = 0, _len1 = links.length; _j < _len1; _j++) {
        link = links[_j];
        _ref = linkaccessor(link), start = _ref.start, end = _ref.end, weight = _ref.weight;
        links_["" + start + "|" + end] = {
          weight: weight,
          start: start,
          end: end,
          link: link
        };
      }
      tick = function() {
        var attractions, bodies, f, f1, f2, position, repulsions, root, tree;
        bodies = bh.bodies(nodes_positions);
        root = bh.root(width, height);
        tree = bh.tree(bodies, root);
        attractions = attractive_forces(links_, nodes_positions, attraction / 1000);
        repulsions = bh.forces(tree, repulsion * 1000, threshold);
        for (id in nodes_positions) {
          position = nodes_positions[id];
          f1 = attractions[id] || [0, 0];
          f2 = repulsions[id] || [0, 0];
          f = O.plus(f1, f2);
          nodes_positions[id] = bound(O.plus(position, f));
        }
        return recompute();
      };
      graph = {
        tick: tick
      };
      recompute = function() {
        var i;
        i = -1;
        graph.curves = map_objects(links_, function(id, _arg1) {
          var end, link, p, q, start;
          start = _arg1.start, end = _arg1.end, link = _arg1.link;
          i += 1;
          p = nodes_positions[start];
          q = nodes_positions[end];
          return {
            link: Polygon({
              points: [p, q],
              closed: false
            }),
            item: link,
            index: i
          };
        });
        graph.nodes = map_objects(nodes_, function(id, node) {
          return {
            point: nodes_positions[id],
            item: node
          };
        });
        return graph;
      };
      return recompute();
    };
  });

}).call(this);
