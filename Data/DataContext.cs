using Microsoft.EntityFrameworkCore;

namespace BaleenWebAPI.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) { }
        public DbSet<EnquiryTable> Enquiries { get; set; }
    }
}
