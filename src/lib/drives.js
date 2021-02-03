const drivelist = require("drivelist");
const { directoryExists } = require("./files");

module.exports = {
  //List of Non System drives
  getNonSystemList: async () => {
    const list = await drivelist.list();
    //console.log(list);
    const filtered = list.filter(
      (drive) => !drive.isSystem && !drive.isReadOnly
    );

    //console.log(filtered);
    const result = filtered.reduce((list, item) => {
      list.push(item.mountpoints[0].label);
      return list;
    }, []);

    if (result) {
      return result;
    } else {
      return [];
    }
  },
};
