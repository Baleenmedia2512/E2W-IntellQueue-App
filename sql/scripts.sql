-- 14-06-2025 - Logesh - gracescans and baleen media DBs -- Live Release
CREATE TABLE fcm_token_table (
    ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    EntryDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    Token VARCHAR(512) NOT NULL UNIQUE
);

CREATE TABLE queue_history_table (
    ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    RateCard VARCHAR(64) NOT NULL,
    QueueSnapshot LONGTEXT NOT NULL,
    TimeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE queue_table (
    ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    QueueIndex INT NOT NULL,
    EntryDateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ClientName VARCHAR(64) NOT NULL,
    ClientContact VARCHAR(10) NOT NULL,
    RateCard VARCHAR(64) NOT NULL,
    RateType VARCHAR(64) NOT NULL,
    Status VARCHAR(64) NOT NULL,
    Remarks VARCHAR(128) NOT NULL,
    FcmToken VARCHAR(255)
);

-- Triggers to add in order_table

-- 1 - insert_queue_from_order
DELIMITER $$

CREATE DEFINER=`root`@`localhost` TRIGGER `insert_queue_from_order`
AFTER INSERT ON `order_table`
FOR EACH ROW
BEGIN
  DECLARE newQueueIndex INT DEFAULT 1;

  IF NEW.CancelFlag = 0 THEN
    -- Step 1: Get highest active QueueIndex for this RateCard
    SELECT IFNULL(MAX(QueueIndex), 0) + 1 INTO newQueueIndex
    FROM queue_table
    WHERE RateCard = NEW.Card
      AND DATE(EntryDateTime) = CURDATE()
      AND Status NOT IN ('Completed', 'Deleted');

    -- Step 2: Insert the new queue entry using the variable
    INSERT INTO queue_table (
        QueueIndex,
        EntryDateTime,
        ClientName,
        ClientContact,
        RateCard,
        RateType,
        Status,
        Remarks
    ) VALUES (
        newQueueIndex,
        NOW(),
        NEW.ClientName,
        NEW.ClientContact,
        NEW.Card,
        NEW.AdType,
        'Waiting',
        'None'
    );
  END IF;
END$$

DELIMITER ;


-- 2 - update_queue_from_order
DELIMITER $$

CREATE DEFINER=`root`@`localhost` TRIGGER `update_queue_from_order`
AFTER UPDATE ON `order_table`
FOR EACH ROW
BEGIN
  -- Case: Order is updated (not cancelled), and relevant fields changed
  IF NEW.CancelFlag <> 1 AND (
      NEW.ClientName <> OLD.ClientName OR
      NEW.ClientContact <> OLD.ClientContact OR
      NEW.Card <> OLD.Card OR
      NEW.AdType <> OLD.AdType
  ) THEN
    UPDATE queue_table
    SET
      ClientName = NEW.ClientName,
      ClientContact = NEW.ClientContact,
      RateCard = NEW.Card,
      RateType = NEW.AdType
    WHERE ClientName = OLD.ClientName  
      AND ClientContact = OLD.ClientContact
      AND RateCard = OLD.Card
      AND RateType = OLD.AdType;
  END IF;
END$$

DELIMITER ;

-- Only in Baleen Media DB
INSERT INTO visibility_table (ElementName)
VALUES ('QueueDashboard');

