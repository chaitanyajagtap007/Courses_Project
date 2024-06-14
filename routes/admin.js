var express = require("express");
var exe = require("./connection");
var router =express.Router();

router.get("/",function(req,res)
{
    if(req.session.admin_id == undefined)
    {
        res.redirect("/admin/login");
    }
    else
    res.render("admin/home.ejs");
    
});

router.get("/manage_slider",async function(req,res)
{
    var data = await exe(`select * from slider`);
    var obj={"slides":data}
    res.render("admin/manage_slider.ejs",obj);
})

router.post("/save_slider",async function(req,res)
{
    const today = new Date();
    var time = today.getTime();

    var file_name= time+req.files.slider_image.name;

    req.files.slider_image.mv("public/uploads/" + file_name);

    var d = req.body;
    // table aadhich create kela hota tya mule query nahi dili :- Table name is :-slider 
    await exe(`INSERT INTO slider (slider_image,slider_title,slider_button_text,slider_button_link) VALUES ('${file_name}','${d.slider_title}','${d.slider_button_text}','${d.slider_button_link}')`);
    
    res.redirect("/admin/manage_slider");
});


router.get("/manage_category", async function(req,res)
{
    var data=await exe(`select * from category`);  
    var obj={"cats":data};
    res.render("admin/manage_category.ejs",obj);
});

router.post("/save_category",async function(req,res)
{
    // exe(`create table category (category_id int primary key AUTO_INCREMENT,category_name varchar(200),category_details text)`);


    var details=req.body.category_details.replaceAll("'","\\'");
    var name =req.body.category_name.replaceAll("'","\\'");

    exe(`INSERT INTO category(category_name,category_details) VALUES ('${name}','${details}')`);

    res.redirect("/admin/manage_category");
});

router.get("/add_course", async function(req,res)
{
    var data= await exe(`select * from category`);
    var obj={"cat_list":data};
    res.render("admin/add_course.ejs",obj)
});

router.post("/save_course",async function(req,res)
{
    const today = new Date();
    var time = today.getTime();

    console.log(req.body);
    console.log(req.files);

    var img_name = time+req.files.course_image.name;
    req.files.course_image.mv("public/uploads/"+img_name);

    var video_name="";
    if(req.files.course_sample_video != undefined)
    {
        video_name = time+req.files.course_sample_video.name;
        req.files.course_sample_video.mv("public/uploads/"+video_name);

    }

    //  CREATE TABLE course_tbl(course_id int primary key AUTO_INCREMENT, course_name text, course_category_id int,course_duration varchar(200),course_price varchar(20), course_image text ,course_sample_video text,course_mentor varchar(200),course_link text, course_platform varchar(100),course_details text)
    var d=req.body;
    var course_name =d.courses_name.replaceAll("'","\\'");
    var course_details =d.course_details.replaceAll("'","\\'"); 
    var sql=`INSERT INTO course_tbl ( course_name,course_category_id,course_duration,course_price,course_image,course_sample_video,course_mentor,course_link,course_platform,course_details) VALUES ('${course_name}','${d.course_category_id}','${d.course_duration}','${d.course_price}','${img_name}','${video_name}','${d.course_mentor}','${d.course_link}','${d.course_platform}','${course_details}')`;

    await exe(sql);
    res.redirect("/admin/add_course");
});

router.get("/course_list", async function(req,res)
{
    var data= await exe(`SELECT * FROM course_tbl,category 
    WHERE course_tbl.course_category_id = category.category_id`);

    var obj={"course_list":data};
    res.render("admin/course_list.ejs",obj);
});

router.get("/courses_details/:id",async function(req,res)
{
    var id= req.params.id;
    var data=await exe(`select * from course_tbl,category WHERE 
    course_tbl.course_category_id =category.category_id AND course_id='${id}'`);
    var obj={"c_det":data};
    res.render("admin/courses_details.ejs",obj);
});

router.get("/all_user_list",async function(req,res)
{
    var user_id = req.session.user_id;
    var courses_list = await exe(`SELECT * FROM user_courses , course_tbl WHERE user_courses.course_id = course_tbl.course_id AND user_id = '${user_id}'`);
    obj={"courses_list":courses_list};
    res.render("admin/all_user_list.ejs",obj);
});


router.get("/sold_courses",async function(req,res)
{
    var sql=`SELECT amount,purchase_date,user_name,course_name,transaction_id FROM user_courses,user_tbl,course_tbl WHERE user_courses.user_id = user_tbl.user_id AND user_courses.course_id = course_tbl.course_id `
    var data= await exe(sql);
    var obj={"sold_list":data};
    // console.log(data);
    res.render("admin/sold_courses.ejs",obj);
});

router.get("/login",function(req,res)
{
    res.render("admin/login.ejs")
});

router.post("/admin_login_process",async function(req,res)
{
    var sql = `SELECT * FROM admin WHERE admin_email = '${req.body.admin_email}' AND admin_password = '${req.body.admin_password}'`;

    var data = await exe(sql);
    if(data.length > 0)
    {
        req.session.admin_id = data[0].admin_id
        res.redirect("/admin");
    }
    else
    {
        res.redirect("/admin");
    }
});

module.exports = router;    