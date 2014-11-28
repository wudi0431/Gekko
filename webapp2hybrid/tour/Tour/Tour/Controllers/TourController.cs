using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Configuration;

namespace Tour.Controllers
{
    public class TourController : Controller
    {
        //
        // GET: /Tour/

        public ActionResult Default()
        {
            Response.Redirect("Index");
            Response.End();
            return null;
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult IndexIPad()
        {
            return View();
        }

        public ActionResult Vacationcity()
        {
            return View();
        }
        public ActionResult VacationcityIPad()
        {
            return View();
        }

        public ActionResult Destination()
        {
            return View();
        }
        public ActionResult DestinationIPad()
        {
            return View();
        }

        public ActionResult Cities()
        {
            return View();
        }

        public ActionResult Destcities()
        {
            return View();
        }

        public ActionResult DestcitiesIPad()
        {
            return View();
        }
		
		public ActionResult Booking_step1()
        {
            return View();
        }

        public ActionResult Booking_step1IPad()
        {
            return View();
        }

        public ActionResult Detail_booking_note()
        {
            return View();
        }

        public ActionResult Detail_booking_noteIPad()
        {
            return View();
        }

        public ActionResult Detail_visa()
        {
            return View();
        }

        public ActionResult Detail_visaIPad()
        {
            return View();
        }

        public ActionResult QuestionIPad()
        {
            return View();
        }
        public ActionResult Question()
        {
            return View();
        }
        

        public ActionResult VacationList(string id1, string id2, string id3, string id4, string id5, string id6)
        {
            ViewData["id1"] = id1;
            ViewData["id2"] = id2;
            ViewData["id3"] = id3;
            ViewData["id4"] = id4;
            ViewData["id5"] = id5;
            ViewData["id6"] = id6;

            return View();
        }

        public ActionResult VacationListIPad(string id1, string id2, string id3, string id4, string id5, string id6)
        {
            ViewData["id1"] = id1;
            ViewData["id2"] = id2;
            ViewData["id3"] = id3;
            ViewData["id4"] = id4;
            ViewData["id5"] = id5;
            ViewData["id6"] = id6;

            return View();
        }

        public ActionResult Detail(string id1, string id2)
        {
            ViewData["id1"] = id1;
            ViewData["id2"] = id2;

            return View();
        }

        public ActionResult DetailIPad(string id1, string id2)
        {
            ViewData["id1"] = id1;
            ViewData["id2"] = id2;

            return View();
        }

    }
}
