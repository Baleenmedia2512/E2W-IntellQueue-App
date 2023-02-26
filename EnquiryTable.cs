namespace BaleenWebAPI
{
    public class EnquiryTable
    {
// public int ID { get; set; }
        public DateTime EntryDateTime { get; set; } 
        public string EntryUser { get; set; } = string.Empty;
        public string ClientContact { get; set; } = string.Empty;
        public string CSE { get; set; } = string.Empty;
        public int Attended { get; set; }
        public int Validity { get; set; }
        public DateTime AttendedDateTime { get; set; }
        public string Source { get; set; } = string.Empty;
        public string ReasonForInvalidity { get; set; } = string.Empty;
        public string ClientName {get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;

    }
}
