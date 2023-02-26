using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace BaleenWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnquiryTableController : Controller
    {
        private static List<EnquiryTable> Enquiries = new List<EnquiryTable>
            {
                new EnquiryTable
                {
                    EntryDateTime= DateTime.Now,
                    ClientContact = "7092211201",
                    CSE = "Usha",
                    Attended = 0,
                    Validity = 1,
                    AttendedDateTime = DateTime.Now,
                    Source = "Own",
                    ReasonForInvalidity = "",
                    ClientName = "Baleen Tester",
                    ClientEmail = "siva@baleenmedia.com"
                }
            };
        [HttpGet]
        public async Task<ActionResult<List<EnquiryTable>>> Get()
        {
            return Ok(Enquiries);
        }
       // [HttpPost]
       // public async 

    }
}
