var mysql=require("mysql");
var util=require("util");
var url=require('url');
var conn = mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"node_course_project"
});

var exe = util.promisify(conn.query).bind(conn);   //sql query run karnya sathi

module.exports = exe;