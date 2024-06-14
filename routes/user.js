var express = require("express");
var exe = require("./connection");
var router = express.Router();

function login(req)
{
    if(req.session.user_id==undefined)
    {
        return false;
    }
    else
    {
        return true;
    }

};

function getDate()
{
    var today = new Date();
    var date = (today.getDate() <10 ) ? "0"+today.getDate() : today.getDate() ;
    var month =(today.getMonth()+1) <10 ? "0"+(today.getMonth()+1) :(today.getMonth()+1);
    var year = today.getFullYear();
    return(year+"-"+month+"-"+date);
}



router.get("/", async function(req,res)
{
    var slides = await exe(`SELECT * FROM slider`);
    var courses=await exe(`SELECT * FROM course_tbl ORDER BY course_id DESC LIMIT 8 `);
    var obj ={"slides":slides,"courses":courses,"login":login(req)};
    res.render("user/home.ejs",obj);
});

router.get("/course_details/:id",async function(req,res)
{
    var id=req.params.id;
    course_det = await exe(`SELECT * FROM course_tbl WHERE course_id = ${id}`);
    var is_purchase = false;
    if(login(req))
    {
        var user_id = req.session.user_id;
        var user_course=await exe(`SELECT * FROM user_courses WHERE user_id ='${user_id}' AND course_id ='${id}' `);
        if(user_course.length > 0)
        {
            is_purchase=true;
        }
    }




    var obj = {"course_det":course_det,"login":login(req),"is_purchase":is_purchase};
    res.render("user/course_details.ejs",obj);
});

router.get("/courses", async function(req,res)
{
    courses= await exe(`SELECT * FROM course_tbl`);
    var obj={"courses":courses,"login":login(req)};
    res.render("user/courses.ejs",obj);
});

router.get("/contact",function(req,res)
{
    var obj={"login":login(req)};
    res.render("user/contact.ejs",obj);
})

router.get("/login",function(req,res)
{
    var obj={"login":login(req)};
    res.render("user/login.ejs",obj);
});

router.get("/register",function(req,res)
{
    var obj={"login":login(req)};
    res.render("user/register.ejs",obj);
});

router.post("/save_user", async function(req,res)
{
    // await exe(`CREATE TABLE user_tbl(user_id int primary key AUTO_INCREMENT, user_name varchar(100),user_mobile varchar(15), user_email varchar(200),user_passward varchar(200))`);

    var d= req.body;
    await exe(`INSERT INTO user_tbl(user_name ,user_mobile, user_email ,user_passward ) VALUES ('${d.user_name}','${d.user_mobile}','${d.user_email}','${d.user_passward}')`);
    res.redirect("/login");
});

router.post("/do_login",async function(req,res)
{
    var d=req.body;
    var sql= `SELECT * FROM user_tbl WHERE user_mobile='${d.user_mobile}' AND user_passward='${d.user_passward}'`;
    var data= await exe(sql);
    if(data.length > 0)
    {
        req.session.user_id=data[0].user_id;
        // res.send("Login success");
        res.redirect("/");
    }
    else
    {
        res.send("Login Failed");
    }
    

});

router.get("/confirm_seat/:id",async function(req,res)
{
    if(req.session.user_id!= undefined)
    {
        // -> ' OR 1 /*
        var id=req.params.id;
        course_det = await exe(`SELECT * FROM course_tbl WHERE course_id = ${id}`);
        user_det =await exe(`SELECT * FROM user_tbl WHERE user_id ='${req.session.user_id}'`)
        var obj = {"course_det":course_det,"user_det":user_det,"login":login(req)};
        res.render("user/confirm_seat.ejs",obj);
    }
    else
    {
        res.send(`
            <script>
                alert('Login First');
                location.href = "/login";
            </script>
        `)
    }
});

router.post("/pay_course_fee/:course_id",async function(req,res)
{
    if(req.session.user_id!= undefined)
    {
        var course_id=req.params.course_id;
        var course_det= await exe(`SELECT * FROM course_tbl WHERE course_id = '${course_id}'`)
        var amt=course_det[0].course_price;
        var user_id=req.session.user_id;
        var today= getDate();
        var sql=`INSERT INTO user_courses(user_id,course_id,amount,purchase_date,transaction_id) VALUES  
                ('${user_id}','${course_id}','${amt}','${today}','${req.body.razorpay_payment_id}')`
        // exe(`CREATE TABLE user_courses (user_courses_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, course_id INT, amount INT, transaction_id varchar(100))`)
        var data=await exe(sql);
        // res.send("User Id = "+user_id +"<br> Course Id " + course_id );
        // res.redirect();
        res.redirect("/my_courses");
    }
    else
    {
        res.send(`
            <script>
                alert('Login First');
                location.href = "/login";
            </script>
        `)
    }
});

router.get("/my_courses",async function(req,res)
{
    if(req.session.user_id!= undefined)
    {
        var user_id = req.session.user_id;
        var courses_list = await exe(`SELECT * FROM user_courses , course_tbl WHERE user_courses.course_id = course_tbl.course_id AND user_id = '${user_id}'`);
        obj={"courses_list":courses_list,"login":login(req)};
        res.render("user/my_courses.ejs",obj);
    }
    else
    {
        res.send(`
            <script>
                alert('Login First');
                location.href = "/login";
            </script>
        `)
    }
});

router.get("/edit_profile",function(req,res)
{
    var user_id = req.session.user_id;
    res.send("id = "+user_id);
    
});

router.post("/feedback",async function(req,res)
{
    // await exe(`CREATE TABLE user_query(user_id int, user_name varchar(100),user_email varchar(200), user_mobile varchar(15),user_query text)`);

    if(req.session.user_id!= undefined)
    {
        var user_id = req.session.user_id;
        var d= req.body;
        await exe(`INSERT INTO user_query(user_id, user_name, user_email, user_mobile, user_query) VALUES   
        ('${user_id}','${d.user_name}','${d.user_email}','${d.user_mobile}','${d.user_query}')`);
        res.send(`
            <script>
                alert('Sens Feedback');
                location.href = "/";
            </script>
        `)
    }
    else
    {
        res.send(`
            <script>
                alert('Login First');
                location.href = "/login";
            </script>
        `)
    }
});


router.get("/logout",function(req,res)
{
    req.session.user_id =undefined;
    res.redirect("/");
});

module.exports = router;    