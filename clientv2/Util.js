/**
 * Created by russell on 3/13/16.
 */

const Grouped = (list, n, empty) => {
  const groups = [];
  const copy = list.slice();
  while(copy.length > 0) {
    const row = copy.splice(0, n);
    while(row.length < n) {
      row.push(empty(row.length));
    }
    groups.push(row);
  }
  return groups;
};

export default {
  Grouped
};
