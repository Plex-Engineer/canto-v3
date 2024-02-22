import Icon from "../icon/icon";
import styles from "./pagination.module.scss";
import Text from "@/components/text";

interface Props {
  currentPage: number;
  totalPages: number;
  handlePageClick: (index: number) => void;
  isMobile?: boolean;
}

export const Pagination = (props: Props) => {
  return (
    <div key="pagination" className={styles.container}>
      <div className={styles.row}>
        <div
          className={styles.iconContainer}
          onClick={() => props.handlePageClick(1)}
          style={{
            opacity: props.currentPage == 1 ? "0.4" : "1",
            cursor: props.currentPage == 1 ? "" : "pointer",
          }}
        >
          <Icon
            themed
            icon={{
              url: "/paginationLeft.svg",
              size: 18,
            }}
          />
        </div>
        <div
          className={styles.button}
          onClick={
            props.currentPage > 1
              ? () => props.handlePageClick(props.currentPage - 1)
              : () => {}
          }
          style={{
            cursor: props.currentPage == 1 ? "" : "pointer",
          }}
        >
          <Text
            font="proto_mono"
            size="lg"
            opacity={props.currentPage == 1 ? 0.4 : 1}
          >
            {" < "}
          </Text>
        </div>
        <div>
          {!props.isMobile || props.totalPages < 6 ? (
            <div className={styles.numbers}>
              {new Array(props.totalPages)
                .fill(null)
                .map((_, i) => i + 1)
                .map((index) => {
                  return (
                    <div
                      key={index}
                      className={styles.number}
                      onClick={() => props.handlePageClick(index)}
                    >
                      <Text
                        font="proto_mono"
                        size="sm"
                        opacity={index == props.currentPage ? 1 : 0.4}
                      >
                        {index}
                      </Text>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className={styles.numbers}>
              {props.currentPage >= props.totalPages - 1 && (
                <div
                  className={styles.number}
                  onClick={() => props.handlePageClick(1)}
                >
                  <Text font="proto_mono" size="sm" opacity={0.4}>
                    1
                  </Text>
                </div>
              )}
              {props.currentPage > 2 && (
                <div
                  //key={index}
                  className={styles.number}
                >
                  <Text font="proto_mono" size="sm">
                    ..
                  </Text>
                </div>
              )}
              {props.currentPage > 1 && (
                <div
                  className={styles.number}
                  onClick={() => props.handlePageClick(props.currentPage - 1)}
                >
                  <Text font="proto_mono" size="sm" opacity={0.4}>
                    {props.currentPage - 1}
                  </Text>
                </div>
              )}
              <div
                className={styles.number}
                onClick={() => props.handlePageClick(props.currentPage)}
              >
                <Text font="proto_mono" size="sm" opacity={1}>
                  {props.currentPage}
                </Text>
              </div>
              {props.currentPage < props.totalPages && (
                <div
                  className={styles.number}
                  onClick={() => props.handlePageClick(props.currentPage + 1)}
                >
                  <Text font="proto_mono" size="sm" opacity={0.4}>
                    {props.currentPage + 1}
                  </Text>
                </div>
              )}
              {props.currentPage < props.totalPages - 1 && (
                <div className={styles.number}>
                  <Text font="proto_mono" size="sm">
                    ..
                  </Text>
                </div>
              )}
              {props.currentPage <= 2 && (
                <div
                  className={styles.number}
                  onClick={() => props.handlePageClick(props.totalPages)}
                >
                  <Text font="proto_mono" size="sm" opacity={0.4}>
                    {props.totalPages}
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={styles.button}
          onClick={
            props.currentPage < props.totalPages
              ? () => props.handlePageClick(props.currentPage + 1)
              : () => {}
          }
          style={{
            cursor: props.currentPage == props.totalPages ? "" : "pointer",
          }}
        >
          <Text
            font="proto_mono"
            size="lg"
            opacity={props.currentPage == props.totalPages ? 0.4 : 1}
          >
            {" > "}
          </Text>
        </div>
        <div
          className={styles.iconContainer}
          onClick={() => props.handlePageClick(props.totalPages)}
          style={{
            opacity: props.currentPage == props.totalPages ? "0.4" : "1",
            cursor: props.currentPage == props.totalPages ? "" : "pointer",
          }}
        >
          <Icon
            themed
            icon={{
              url: "/paginationRight.svg",
              size: 18,
            }}
          />
        </div>
      </div>
    </div>
  );
};
