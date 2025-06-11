// Simplified faker implementation for generating mock data
export const faker = {
  name: {
    firstName: () => {
      const firstNames = [
        'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James',
        'Olivia', 'Robert', 'Amelia', 'William', 'Sophia', 'Joseph',
        'Ava', 'Thomas', 'Emily', 'Charles', 'Grace', 'Daniel', 'Chloe',
        'Matthew', 'Lily', 'Anthony', 'Hannah', 'Mark', 'Ella', 'Donald',
        'Victoria', 'Steven', 'Elizabeth', 'Paul', 'Jennifer', 'Andrew', 
        'Linda', 'Kenneth', 'Patricia', 'George', 'Barbara', 'Joshua', 'Susan',
        'Rajesh', 'Priya', 'Amit', 'Neha', 'Rahul', 'Ananya', 'Vijay', 'Pooja'
      ];
      return firstNames[Math.floor(Math.random() * firstNames.length)];
    },
    lastName: () => {
      const lastNames = [
        'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller',
        'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White',
        'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
        'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen',
        'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott',
        'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell',
        'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Shah', 'Verma', 'Mehta'
      ];
      return lastNames[Math.floor(Math.random() * lastNames.length)];
    }
  },
  phone: {
    number: () => {
      const formats = [
        '+91 ##########',
        '+91 #### ######',
        '##########',
        '#### ######'
      ];
      
      let format = formats[Math.floor(Math.random() * formats.length)];
      return format.replace(/#/g, () => Math.floor(Math.random() * 10).toString());
    }
  },
  internet: {
    email: () => {
      const firstName = faker.name.firstName().toLowerCase();
      const lastName = faker.name.lastName().toLowerCase();
      const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com', 'company.co.in'];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      
      const formats = [
        `${firstName}.${lastName}@${domain}`,
        `${firstName}${Math.floor(Math.random() * 100)}@${domain}`,
        `${firstName[0]}${lastName}@${domain}`,
        `${lastName}.${firstName}@${domain}`
      ];
      
      return formats[Math.floor(Math.random() * formats.length)];
    }
  },
  lorem: {
    sentence: () => {
      const sentences = [
        "Interested in digital marketing services.",
        "Looking for web development quotation.",
        "Need help with social media management.",
        "Inquiring about your services.",
        "Want to discuss a potential project.",
        "Seeking consultation for business growth.",
        "Interested in your portfolio.",
        "Need assistance with SEO strategy.",
        "Looking to hire for long-term project.",
        "Requesting more information about pricing."
      ];
      return sentences[Math.floor(Math.random() * sentences.length)];
    }
  },
  address: {
    city: () => {
      const cities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
        'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 
        'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 
        'Ghaziabad', 'Ludhiana', 'Coimbatore', 'Kochi', 'Mysore', 'Ranchi'
      ];
      return cities[Math.floor(Math.random() * cities.length)];
    }
  }
};