using Microsoft.EntityFrameworkCore;

namespace ReadApi.Models
{
    public class MeteorologyContext : DbContext
    {
        public MeteorologyContext(DbContextOptions<MeteorologyContext> options)
            : base(options)
        {
        }

        public DbSet<Users> Users { get; set; }
        public DbSet<Weather> Weather { get; set; }
    }
}