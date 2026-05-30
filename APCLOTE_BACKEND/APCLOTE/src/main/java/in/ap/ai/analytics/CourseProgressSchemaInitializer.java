package in.ap.ai.analytics;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class CourseProgressSchemaInitializer {

    @Bean
    ApplicationRunner courseProgressIdFixRunner(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute(
                        "ALTER TABLE course_progress MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT"
                );
            } catch (Exception ignored) {
                // If the table does not exist yet or the column is already correct, Hibernate/update will handle it.
            }
        };
    }
}
